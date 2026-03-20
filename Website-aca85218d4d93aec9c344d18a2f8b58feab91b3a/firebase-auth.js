/**
 * Planet Motors — Firebase Auth + Firestore Integration
 * ─────────────────────────────────────────────────────────────
 * This file is the ONLY place Firebase is used on the frontend.
 * It overrides all localStorage logic in scripts.js with real
 * Firestore reads/writes and real Firebase Auth.
 *
 * Collections used:
 *   users             — user profiles (uid → {firstName, lastName, email, phone})
 *   savedVehicles     — {userId, vehicleId, make, model, year, price, image, savedAt}
 *   priceAlerts       — {userId, vehicleId, vehicleName, currentPrice, userEmail, createdAt}
 *   contacts          — contact form submissions
 *   sellRequests      — sell/trade-in form submissions
 *   leads             — finance application submissions
 *   reservations      — $250 deposit reservations
 */

import {
  auth, db, googleProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  doc, setDoc, getDoc, deleteDoc,
  collection, query, where, getDocs,
  addDoc, serverTimestamp
} from './firebase-config.js';

// ─────────────────────────────────────────────────────────────
// STATE — cached set of saved IDs and alerted IDs for this session
// ─────────────────────────────────────────────────────────────

const _saved  = new Set(); // vehicleId strings the user has saved
const _alerted = new Set(); // vehicleId strings the user has alerted

// ─────────────────────────────────────────────────────────────
// MODAL HELPERS
// ─────────────────────────────────────────────────────────────

function showErr(msg) {
  const el = document.getElementById('pmAuthErr');
  const su = document.getElementById('pmAuthSuccess');
  if (su) su.className = 'pm-auth-success';
  if (el) { el.textContent = msg; el.className = 'pm-auth-err show'; }
}

function showSuccess(msg) {
  const el = document.getElementById('pmAuthSuccess');
  const er = document.getElementById('pmAuthErr');
  if (er) er.className = 'pm-auth-err';
  if (el) { el.textContent = msg; el.className = 'pm-auth-success show'; }
}

function clearMessages() {
  document.getElementById('pmAuthErr')     ?.classList.remove('show');
  document.getElementById('pmAuthSuccess') ?.classList.remove('show');
}

function setLoading(formId, loading) {
  const btn = document.querySelector(`#${formId} .pm-auth-btn`);
  if (btn) loading ? btn.setAttribute('data-loading','true') : btn.removeAttribute('data-loading');
}

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────

function updateNavbar(user) {
  const signInArea = document.getElementById('pmNavSignIn');
  const loggedArea = document.getElementById('pmNavLoggedIn');
  const nameEl     = document.getElementById('pmNavUserName');
  if (user) {
    const name = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
    if (signInArea) signInArea.style.display = 'none';
    if (loggedArea) loggedArea.style.display = 'flex';
    if (nameEl)     nameEl.textContent = 'Hi, ' + name;
    window.currentUser = { email: user.email, first: name, uid: user.uid };
  } else {
    if (signInArea) signInArea.style.display = 'flex';
    if (loggedArea) loggedArea.style.display = 'none';
    window.currentUser = null;
  }
}

// ─────────────────────────────────────────────────────────────
// AUTH STATE — runs once on every page load
// ─────────────────────────────────────────────────────────────

onAuthStateChanged(auth, async (user) => {
  updateNavbar(user);
  if (user) {
    await _loadUserData(user.uid);
  } else {
    _saved.clear();
    _alerted.clear();
    _refreshAllCardHearts();
  }
});

// Pull saved vehicles + alerts + user profile (incl. postalCode) from Firestore.
// Auto-triggers delivery calculator if a saved postal code is found.
async function _loadUserData(uid) {
  _saved.clear();
  _alerted.clear();
  try {
    const [savSnap, altSnap, userSnap] = await Promise.all([
      getDocs(query(collection(db, 'savedVehicles'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'priceAlerts'),   where('userId', '==', uid))),
      getDoc(doc(db, 'users', uid))
    ]);
    savSnap.forEach(d => _saved.add(String(d.data().vehicleId)));
    altSnap.forEach(d => _alerted.add(String(d.data().vehicleId)));

    // Load full user profile — augment window.currentUser with last/phone/postalCode
    if (userSnap.exists()) {
      const profile = userSnap.data();
      if (window.currentUser) {
        window.currentUser.last       = profile.lastName   || '';
        window.currentUser.phone      = profile.phone      || '';
        window.currentUser.postalCode = profile.postalCode || '';
      }
      // Auto-populate the VDP delivery widget with the saved postal code
      if (profile.postalCode) {
        _applyUserPostal(profile.postalCode);
      }
    }
  } catch (e) {
    console.warn('[PM Firebase] Could not load user data:', e.message);
  }
  _refreshAllCardHearts();
  _refreshVdpButtons();
}

/*
 * _applyUserPostal — fills #deliveryPostal and triggers calcDelivery()
 * when a user signs in and has a saved postal code on their profile.
 * Only runs if the input is currently empty (avoids overwriting a manual entry).
 */
function _applyUserPostal(postal) {
  if (!postal) return;
  const input = document.getElementById('deliveryPostal');
  if (input && !input.value.trim()) {
    input.value = postal;
    // Small delay to ensure page DOM is fully rendered before calling calcDelivery
    setTimeout(function() {
      if (typeof calcDelivery === 'function') calcDelivery();
    }, 350);
  }
}

// ─────────────────────────────────────────────────────────────
// UI REFRESH HELPERS
// ─────────────────────────────────────────────────────────────

// Mark/unmark every card heart in the inventory grid
function _refreshAllCardHearts() {
  document.querySelectorAll('.card-heart[data-vid]').forEach(el => {
    const id = el.getAttribute('data-vid');
    if (_saved.has(String(id))) {
      el.textContent = '♥';
      el.style.color = '#d02126';
      el.style.background = '#fff';
    } else {
      el.textContent = '♡';
      el.style.color = '';
      el.style.background = '';
    }
  });
}

// Refresh VDP save + notify buttons based on selectedVehicle
function _refreshVdpButtons() {
  const v = window.selectedVehicle;
  if (!v) return;
  const id = String(v.id);

  // Save button
  if (typeof updateSaveBtn === 'function') updateSaveBtn(_saved.has(id));

  // Notify button
  const btn      = document.getElementById('vdpNotifyBtn');
  const lbl      = document.getElementById('vdpNotifyLabel');
  const trackBtn = document.getElementById('vdpTrackPriceBtn');
  const trackLbl = document.getElementById('vdpTrackPriceLabel');
  const isAlerted = _alerted.has(id);
  if (btn) btn.classList.toggle('notified', isAlerted);
  if (lbl) lbl.textContent = isAlerted ? 'Notified ✓' : 'Notify';
  if (trackBtn) trackBtn.classList.toggle('notified', isAlerted);
  if (trackLbl) trackLbl.textContent = isAlerted ? 'Tracking ✓' : 'Track price';
}

// ─────────────────────────────────────────────────────────────
// OVERRIDE pmAuth
// ─────────────────────────────────────────────────────────────

window.pmAuth = Object.assign(window.pmAuth || {}, {

  open(afterFn) {
    window._afterAuth = afterFn || null;
    clearMessages();
    this.switchTab('signin');
    const o = document.getElementById('pm-auth-overlay');
    if (o) { o.classList.add('open'); document.body.style.overflow = 'hidden'; }
    if (typeof pmTrapFocus === 'function') pmTrapFocus('pm-auth-overlay');
  },

  close() {
    const o = document.getElementById('pm-auth-overlay');
    if (typeof pmReleaseFocus === 'function') pmReleaseFocus('pm-auth-overlay');
    if (o) o.classList.remove('open');
    document.body.style.overflow = '';
    window._afterAuth = null;
  },

  overlayClick(e) {
    if (e.target.id === 'pm-auth-overlay') this.close();
  },

  switchTab(tab) {
    clearMessages();
    ['signin','create'].forEach(t => {
      const tabEl  = document.getElementById('pmAuthTab'  + t.charAt(0).toUpperCase() + t.slice(1));
      const formEl = document.getElementById('pmForm'     + t.charAt(0).toUpperCase() + t.slice(1));
      if (tabEl)  { tabEl.className  = 'pm-auth-tab' + (t === tab ? ' active' : ''); tabEl.setAttribute('aria-selected', String(t === tab)); }
      if (formEl) formEl.hidden = t !== tab;
    });
  },

  // ── SIGN IN ──────────────────────────────────────────────────
  async signIn() {
    const email = document.getElementById('pmSiEmail')?.value.trim().toLowerCase() || '';
    const pass  = document.getElementById('pmSiPass')?.value || '';
    if (!email || !pass) { showErr('Please enter your email and password.'); return; }
    setLoading('pmFormSignin', true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      showSuccess('Welcome back! ✓');
      setTimeout(() => { const cb = window._afterAuth; this.close(); cb?.(); }, 800);
    } catch (err) {
      showErr(_fbErr(err.code));
    } finally {
      setLoading('pmFormSignin', false);
    }
  },

  // ── CREATE ACCOUNT ───────────────────────────────────────────
  async createAccount() {
    const first  = document.getElementById('pmCaFirst')?.value.trim() || '';
    const last   = document.getElementById('pmCaLast')?.value.trim()  || '';
    const email  = document.getElementById('pmCaEmail')?.value.trim().toLowerCase() || '';
    const phone  = document.getElementById('pmCaPhone')?.value.trim() || '';
    const pass   = document.getElementById('pmCaPass')?.value || '';
    // Postal code — optional; normalise to uppercase A1A 1A1 format
    const rawPostal = document.getElementById('pmCaPostal')?.value.trim().toUpperCase() || '';
    const cleanPostal = rawPostal.replace(/\s/g, '');
    const postalCode  = cleanPostal.length === 6
      ? cleanPostal.slice(0, 3) + ' ' + cleanPostal.slice(3)
      : rawPostal; // keep as-is if already formatted or empty
    if (!first || !last)       { showErr('Please enter your first and last name.'); return; }
    if (!email.includes('@'))  { showErr('Please enter a valid email address.'); return; }
    if (pass.length < 6)       { showErr('Password must be at least 6 characters.'); return; }
    setLoading('pmFormCreate', true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: first + ' ' + last });
      try {
        const profileData = {
          firstName: first, lastName: last, email, phone, createdAt: serverTimestamp()
        };
        // Only save postalCode if one was provided
        if (postalCode) profileData.postalCode = postalCode;
        await setDoc(doc(db, 'users', cred.user.uid), profileData);
      } catch (fsErr) {
        console.warn('[PM Firebase] Could not save user profile:', fsErr.message);
      }
      showSuccess('Account created! Welcome, ' + first + ' ✓');
      setTimeout(() => { const cb = window._afterAuth; this.close(); cb?.(); }, 900);
    } catch (err) {
      showErr(_fbErr(err.code));
    } finally {
      setLoading('pmFormCreate', false);
    }
  },

  // ── GOOGLE SIGN-IN ───────────────────────────────────────────
  async socialLogin(provider) {
    if (provider !== 'google') { showErr('Only Google sign-in is available right now.'); return; }
    clearMessages();
    showSuccess('Connecting to Google...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user   = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName:  user.displayName?.split(' ').slice(1).join(' ') || '',
        email:     user.email,
        photoURL:  user.photoURL || '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      showSuccess('Signed in with Google ✓');
      setTimeout(() => { const cb = window._afterAuth; this.close(); cb?.(); }, 700);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') showErr(_fbErr(err.code));
      else clearMessages();
    }
  },

  // ── SIGN OUT ─────────────────────────────────────────────────
  async signOut() {
    await signOut(auth);
    _saved.clear();
    _alerted.clear();
    _refreshAllCardHearts();
    _refreshVdpButtons();
    document.querySelector('.nav-account-dropdown-menu')?.classList.remove('open');
    if (typeof showNotification === 'function') showNotification('Signed out successfully.');
  },

  // ── FORGOT PASSWORD ──────────────────────────────────────────
  async forgotPass() {
    const email = document.getElementById('pmSiEmail')?.value.trim().toLowerCase() || '';
    if (!email) { showErr('Enter your email above first.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      showSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      showErr(_fbErr(err.code));
    }
  },

  toggleDropdown() {
    document.getElementById('pmNavUserDropdown')?.classList.toggle('open');
  }
});

// ─────────────────────────────────────────────────────────────
// GATE CHECKOUT BEHIND AUTH
// ─────────────────────────────────────────────────────────────

const _origOpenCheckout = window.openCheckout;
window.openCheckout = function() {
  if (!window.selectedVehicle) {
    if (typeof showNotification === 'function') showNotification('Please select a vehicle first.');
    return;
  }
  if (!auth.currentUser) {
    window.pmAuth.open(() => { if (_origOpenCheckout) _origOpenCheckout(); });
    return;
  }
  if (_origOpenCheckout) _origOpenCheckout();
};

// ─────────────────────────────────────────────────────────────
// SAVED VEHICLES
// ─────────────────────────────────────────────────────────────

// VDP save button (heart on vehicle detail panel)
window.toggleSaveVehicle = async function() {
  const v = window.selectedVehicle;
  if (!v) { if (typeof showNotification === 'function') showNotification('Please open a vehicle to save it.'); return; }
  if (!auth.currentUser) {
    window.pmAuth.open(async () => { await window.toggleSaveVehicle(); });
    return;
  }
  const uid    = auth.currentUser.uid;
  const id     = String(v.id);
  const docRef = doc(db, 'savedVehicles', `${uid}_${id}`);
  try {
    if (_saved.has(id)) {
      await deleteDoc(docRef);
      _saved.delete(id);
      if (typeof updateSaveBtn === 'function') updateSaveBtn(false);
      if (typeof showNotification === 'function') showNotification('Vehicle removed from saved list.');
    } else {
      await setDoc(docRef, {
        userId: uid, vehicleId: v.id,
        make: v.make, model: v.model, year: v.year,
        price: v.price, image: v.images?.[0] || v.img || '',
        savedAt: serverTimestamp()
      });
      _saved.add(id);
      if (typeof updateSaveBtn === 'function') updateSaveBtn(true);
      if (typeof showSavedBar === 'function') showSavedBar('♥ ' + v.year + ' ' + v.make + ' ' + v.model + ' saved!');
    }
  } catch (e) {
    console.error('[PM Firebase] toggleSaveVehicle:', e);
    if (typeof showNotification === 'function') showNotification('Could not save vehicle. Please try again.');
  }
};

// Card heart button (inventory grid)
window.toggleSaveVehicleCard = async function(vehicleId, el) {
  if (!auth.currentUser) {
    window.pmAuth.open(async () => { await window.toggleSaveVehicleCard(vehicleId, el); });
    return;
  }
  const uid    = auth.currentUser.uid;
  const id     = String(vehicleId);
  const docRef = doc(db, 'savedVehicles', `${uid}_${id}`);
  try {
    if (_saved.has(id)) {
      await deleteDoc(docRef);
      _saved.delete(id);
      if (el) { el.textContent = '♡'; el.style.color = ''; el.style.background = ''; }
      if (typeof showNotification === 'function') showNotification('Removed from saved list.');
    } else {
      const v = (window.vehicles || window.INVENTORY || []).find(x => String(x.id) === id);
      await setDoc(docRef, {
        userId: uid, vehicleId: vehicleId,
        make: v?.make || '', model: v?.model || '', year: v?.year || '',
        price: v?.price || 0, image: v?.images?.[0] || v?.img || '',
        savedAt: serverTimestamp()
      });
      _saved.add(id);
      if (el) { el.textContent = '♥'; el.style.color = '#d02126'; el.style.background = '#fff'; }
      const label = v ? `${v.year} ${v.make} ${v.model}` : 'Vehicle';
      if (typeof showSavedBar === 'function') showSavedBar('♥ ' + label + ' saved!');
    }
  } catch (e) {
    console.error('[PM Firebase] toggleSaveVehicleCard:', e);
  }
};

// Override syncVdpSaveState — called when VDP panel opens
window.syncVdpSaveState = function() {
  _refreshVdpButtons();
};

// isVehicleSaved — used inline in card render to pre-mark hearts
window.isVehicleSaved = function(id) {
  return _saved.has(String(id));
};

// Exposed so renderInventory() can call it after re-rendering cards
window._pmRefreshHearts = _refreshAllCardHearts;

// ─────────────────────────────────────────────────────────────
// PRICE ALERTS
// ─────────────────────────────────────────────────────────────

window.togglePriceAlert = async function() {
  const v = window.selectedVehicle;
  if (!v) { if (typeof showNotification === 'function') showNotification('Please open a vehicle first.'); return; }
  if (!auth.currentUser) {
    window.pmAuth.open(async () => { await window.togglePriceAlert(); });
    return;
  }
  const uid    = auth.currentUser.uid;
  const id     = String(v.id);
  const docRef = doc(db, 'priceAlerts', `alert_${uid}_${id}`);
  const btn      = document.getElementById('vdpNotifyBtn');
  const lbl      = document.getElementById('vdpNotifyLabel');
  const trackBtn = document.getElementById('vdpTrackPriceBtn');
  const trackLbl = document.getElementById('vdpTrackPriceLabel');
  try {
    if (_alerted.has(id)) {
      await deleteDoc(docRef);
      _alerted.delete(id);
      if (btn) btn.classList.remove('notified');
      if (lbl) lbl.textContent = 'Notify';
      if (trackBtn) trackBtn.classList.remove('notified');
      if (trackLbl) trackLbl.textContent = 'Track price';
      if (typeof showNotification === 'function') showNotification('Price alert removed.');
    } else {
      await setDoc(docRef, {
        userId: uid, userEmail: auth.currentUser.email,
        vehicleId: v.id,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        currentPrice: v.price,
        createdAt: serverTimestamp()
      });
      _alerted.add(id);
      if (btn) btn.classList.add('notified');
      if (lbl) lbl.textContent = 'Notified ✓';
      if (trackBtn) trackBtn.classList.add('notified');
      if (trackLbl) trackLbl.textContent = 'Tracking ✓';
      if (typeof showNotification === 'function') showNotification('🔔 You\'ll be emailed when the price drops on this vehicle.');
    }
  } catch (e) {
    console.error('[PM Firebase] togglePriceAlert:', e);
    if (typeof showNotification === 'function') showNotification('Could not set alert. Please try again.');
  }
};

// ─────────────────────────────────────────────────────────────
// CONTACT FORM → Firestore contacts collection
// IDs in index.html: contactName, contactPhone, contactEmail2,
//                    contactSubject, contactMsg
// ─────────────────────────────────────────────────────────────

window.submitContactForm = async function() {
  const name    = document.getElementById('contactName')?.value.trim()    || '';
  const phone   = document.getElementById('contactPhone')?.value.trim()   || '';
  const email   = document.getElementById('contactEmail2')?.value.trim()  || '';
  const subject = document.getElementById('contactSubject')?.value.trim() || '';
  const message = document.getElementById('contactMsg')?.value.trim()     || '';
  if (!name)            { if (typeof showNotification === 'function') showNotification('Please enter your name.'); return; }
  if (!email && !phone) { if (typeof showNotification === 'function') showNotification('Please enter an email or phone number.'); return; }
  if (!message)         { if (typeof showNotification === 'function') showNotification('Please enter a message.'); return; }
  const btn = document.querySelector('[onclick*="submitContactForm"]');
  if (btn) btn.setAttribute('data-loading','true');
  try {
    await addDoc(collection(db, 'contacts'), {
      name, phone, email, subject, message,
      userId: auth.currentUser?.uid || null, createdAt: serverTimestamp()
    });
    if (typeof showNotification === 'function') showNotification('✅ Message sent! We\'ll get back to you within 1 business hour.');
    ['contactName','contactPhone','contactEmail2','contactMsg'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
  } catch (e) {
    console.error('[PM Firebase] submitContactForm:', e);
    if (typeof showNotification === 'function') showNotification('Could not send message. Please call us at 1-866-797-3332.');
  } finally {
    if (btn) btn.removeAttribute('data-loading');
  }
};

// ─────────────────────────────────────────────────────────────
// SELL / TRADE-IN FORM → Firestore sellRequests collection
// IDs: sellYear, sellMake, sellModel, sellTrim, sellKm,
//      sellName, sellPhone, sellNotes
// ─────────────────────────────────────────────────────────────

window.submitSellForm = async function() {
  const year  = document.getElementById('sellYear')?.value.trim()  || '';
  const make  = document.getElementById('sellMake')?.value.trim()  || '';
  const model = document.getElementById('sellModel')?.value.trim() || '';
  const km    = document.getElementById('sellKm')?.value.trim()    || '';
  const name  = document.getElementById('sellName')?.value.trim()  || '';
  const phone = document.getElementById('sellPhone')?.value.trim() || '';
  const notes = document.getElementById('sellNotes')?.value.trim() || '';
  const trim  = document.getElementById('sellTrim')?.value.trim()  || '';
  if (!year || !make || !model) { if (typeof showNotification === 'function') showNotification('Please enter your vehicle year, make, and model.'); return; }
  if (!name || !phone)          { if (typeof showNotification === 'function') showNotification('Please enter your name and phone number.'); return; }
  const btn = document.querySelector('[onclick*="submitSellForm"]');
  if (btn) btn.setAttribute('data-loading','true');
  try {
    await addDoc(collection(db, 'sellRequests'), {
      vehicle: { year, make, model, trim, km },
      contact: { name, phone }, notes,
      userId: auth.currentUser?.uid || null, status: 'new', createdAt: serverTimestamp()
    });
    if (typeof showNotification === 'function') showNotification('✅ Request received! We\'ll call you with an offer within 1 business hour.');
    ['sellYear','sellMake','sellModel','sellTrim','sellKm','sellName','sellPhone','sellNotes'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
  } catch (e) {
    console.error('[PM Firebase] submitSellForm:', e);
    if (typeof showNotification === 'function') showNotification('Could not submit. Please call us at 1-866-797-3332.');
  } finally {
    if (btn) btn.removeAttribute('data-loading');
  }
};

// ─────────────────────────────────────────────────────────────
// SAVE RESERVATION — called from scripts.js on checkout submit
// ─────────────────────────────────────────────────────────────

window.saveReservation = async function(state, vehicle) {
  try {
    const docRef = await addDoc(collection(db, 'reservations'), {
      refNum:      state.refNum,
      vehicleId:   vehicle.id,
      vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}`,
      vehiclePrice: vehicle.price,
      name:        `${state.personal.first} ${state.personal.last}`.trim(),
      email:       state.personal.email,
      phone:       state.personal.phone,
      dob:         state.personal.dob || '',
      address: {
        addr:  state.personal.addr,
        city:  state.personal.city,
        prov:  state.personal.prov,
        postal: state.personal.postal
      },
      payment:     state.payment,
      financing:   state.payment === 'finance' ? {
        down: state.down, term: state.term, apr: state.apr, gap: state.gap,
        employer: state.credit.employer, income: state.credit.income,
        employed: state.credit.employed
      } : null,
      trade: state.hasTrade ? {
        year: state.trade.year, make: state.trade.make, model: state.trade.model,
        trim: state.trade.trim, km: state.trade.km, condition: state.trade.condition,
        offer: state.tradeOffer
      } : null,
      delivery: {
        method: state.delivery.method,
        date:   state.delivery.date,
        time:   state.delivery.time,
        addr:   state.delivery.addr,
        city:   state.delivery.city,
        prov:   state.delivery.prov,
        postal: state.delivery.postal
      },
      userId:    auth.currentUser?.uid || null,
      status:    'new',
      createdAt: serverTimestamp()
    });
    console.log('[PM] Reservation saved:', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('[PM Firebase] saveReservation:', e);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// CLOSE DROPDOWN ON OUTSIDE CLICK
// ─────────────────────────────────────────────────────────────

document.addEventListener('click', (e) => {
  if (!e.target.closest?.('.nav-account-dropdown')) {
    document.querySelector('.nav-account-dropdown-menu')?.classList.remove('open');
  }
});

// ─────────────────────────────────────────────────────────────
// FIREBASE ERROR MESSAGES
// ─────────────────────────────────────────────────────────────

function _fbErr(code) {
  return ({
    'auth/user-not-found':           'No account found with that email.',
    'auth/wrong-password':           'Incorrect password. Please try again.',
    'auth/invalid-credential':       'Incorrect email or password. Please try again.',
    'auth/email-already-in-use':     'An account with this email already exists. Please sign in.',
    'auth/invalid-email':            'Please enter a valid email address.',
    'auth/weak-password':            'Password must be at least 6 characters.',
    'auth/too-many-requests':        'Too many attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed':   'Network error. Please check your connection.',
    'auth/popup-blocked':            'Popup was blocked. Please allow popups for this site.',
    'auth/popup-closed-by-user':     'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request':  'Sign-in was cancelled. Please try again.',
    'auth/unauthorized-domain':      'Sign-in is not enabled for this domain. Please contact support.',
    'auth/operation-not-allowed':    'This sign-in method is not enabled. Please contact support.',
    'auth/user-disabled':            'This account has been disabled. Please contact support.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Try signing in with a different method.',
    'auth/requires-recent-login':    'Please sign out and sign in again to continue.',
    'auth/configuration-not-found':  'Authentication is not configured. Please contact support.',
  })[code] || ('Something went wrong (' + (code || 'unknown') + '). Please try again or call 1-866-797-3332.');
}
