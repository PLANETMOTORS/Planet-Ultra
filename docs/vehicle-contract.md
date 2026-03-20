# Vehicle Contract

This document defines the source-of-truth vehicle data contract for the Planet-Ultra platform.

## Required identity fields
- id
- slug
- vin
- stockNumber

## Required core vehicle fields
- year
- make
- model
- mileageKm
- priceCad
- status
- heroImage

## Optional descriptive fields
- trim
- bodyStyle
- drivetrain
- fuelType
- transmission
- exteriorColor
- interiorColor

## Optional pricing fields
- salePriceCad

## Optional merchandising fields
- isFeatured
- isCertified

## Media fields
- heroImage
- galleryImages
- hero360Asset

## SEO fields
- seoTitle
- seoDescription

## Timestamps
- createdAt
- updatedAt

## Allowed status values
- available
- pending
- reserved
- sold

## Media rules
- heroImage is required
- galleryImages is optional
- hero360Asset is optional
- 360 assets must not block first page render

## Notes
This contract is the source of truth for:
- VDP rendering
- inventory cards
- inventory search
- sold/reserved states
- metadata generation
- future 360 media support
