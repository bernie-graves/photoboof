# Photobooth Template Specifications

## Template Dimensions

**Required Size**: 1200px width × 1800px height (2:3 aspect ratio)

The template system uses a 2×2 grid layout for the 4 captured photos, positioned in the middle section of the template with header and footer areas.

## Photo Capture Specifications

**Critical**: Photos are captured at an aspect ratio that matches the template cell dimensions (596px × 626px ≈ 0.95:1).

- **Photo Aspect Ratio**: 596:626 (≈0.95:1, nearly square but slightly taller)
- **Per-Photo Dimensions**: 596px width × 626px height
- **Capture Process**: The camera preview shows the exact frame, and only the content within this frame is captured
- **Post-Capture Scaling**: Photos are scaled to fit perfectly within template cells while maintaining aspect ratio

## Template Layout Structure

Templates are divided into three sections:

```
┌──────────────────────────────────┐
│        HEADER AREA (15%)         │
│    ~270px height - for text,     │
│    names, date, decorations     │
├──────────────────────────────────┤
│                                  │
│   Photo 1 (Top-Left)    Photo 2 (Top-Right)   │
│   0,270 to 596,896      604,270 to 1200,896 │
│   (596px × 626px)       (596px × 626px)       │
│                                  │
│   Photo 3 (Bottom-Left) Photo 4 (Bottom-Right)│
│   0,904 to 596,1530     604,904 to 1200,1530 │
│   (596px × 626px)       (596px × 626px)       │
│                                  │
├──────────────────────────────────┤
│        FOOTER AREA (15%)         │
│    ~270px height - for hashtags,│
│    venue info, thank you message │
└──────────────────────────────────┘
```

*Note: 8px borders are automatically added between photos in the grid. Photo dimensions are calculated as (available space - border) / 2: (1200-8)/2 = 596px width, (1260-8)/2 = 626px height.

## Photo Grid Positioning

### Layout Calculations
- **Header Height**: 15% of template height = 270px
- **Photo Grid Height**: 70% of template height = 1260px (each photo: 630px height)
- **Footer Height**: 15% of template height = 270px
- **Photo Width**: 50% of template width = 600px

### Actual Photo Positions (Current Implementation)
The system places photos in the middle section with 8px borders between them.
Photo dimensions are calculated to fit within the available space: (1200-8)/2 = 596px width, (1260-8)/2 = 626px height.

### Photo 1 Position (Top-Left)
- **X**: 0 to 596px
- **Y**: 270px to 896px (header to middle)
- **Size**: 596px × 626px

### Photo 2 Position (Top-Right)  
- **X**: 604px to 1200px (596px + 8px border)
- **Y**: 270px to 896px (header to middle)
- **Size**: 596px × 626px

### Photo 3 Position (Bottom-Left)
- **X**: 0 to 596px
- **Y**: 904px to 1530px (middle to footer area + 8px border)
- **Size**: 596px × 626px

### Photo 4 Position (Bottom-Right)
- **X**: 604px to 1200px (596px + 8px border)
- **Y**: 904px to 1530px (middle to footer area + 8px border)
- **Size**: 596px × 626px

## Design Guidelines

1. **Transparent Windows**: Make the areas where photos will appear transparent (alpha channel = 0)
2. **Layout Structure**: Design your template with three distinct sections (header, photo grid, footer)
3. **Header Area**: Use top 15% (270px) for names, dates, decorative elements
4. **Photo Grid**: Use middle 70% (1260px) for 4 transparent photo windows
5. **Footer Area**: Use bottom 15% (270px) for hashtags, venue info, messages
6. **Photo Windows**: Each transparent window should be approximately 600px × 630px
7. **File Format**: Must be PNG with transparency support
8. **Resolution**: Use exactly 1200px × 1800px for proper scaling

## Example Template Structure

A typical wedding photobooth template has:
- **Header area** (top 15%): "Abby & Bertnie SAVE THE DATE", decorative elements
- **Photo grid** (middle 70%): 4 transparent windows for the photos
- **Footer area** (bottom 15%): "06 . 14 . 2026 # ABBY AND BERTNIE", additional decorations

## Photo Insertion Behavior

The system automatically:
- Captures photos at 596:626 aspect ratio to match template cells
- Shows users the exact capture frame during photo taking (using cover mode)
- Uses cover mode scaling: photos fill cells completely, cropping overflow
- Adds 8px borders between photos in the 2×2 grid
- Positions photos in the 2×2 grid within the designated photo area
- Captured image exactly matches what users see in the preview frame

## Template Creation Checklist

When creating a new template:
- [ ] Canvas size: 1200px × 1800px
- [ ] Header area: Top 270px (15%) for text and decorations
- [ ] Photo grid: Middle 1260px (70%) with 4 transparent windows
- [ ] Each photo window: Exactly 596px × 626px (arranged in 2×2 grid with 8px borders)
- [ ] Account for 8px borders between photos in layout
- [ ] Footer area: Bottom 270px (15%) for additional text
- [ ] Photo windows are fully transparent (alpha = 0)
- [ ] File saved as PNG with transparency
- [ ] Test with sample photos to verify proper fit

## Technical Implementation

The compositing logic in `Photobooth.jsx` handles:
1. Loading the template as the base canvas (1200px × 1800px)
2. Calculating header (15%), photo grid (70%), and footer (15%) areas
3. Creating a 2×2 photo grid within the middle section with 8px borders
4. Calculating photo dimensions: (available space - border) / 2 = 596px × 626px
5. Loading each captured photo (captured at 596:626 aspect ratio)
6. Using cover mode scaling to fill cells completely (cropping overflow)
7. Drawing photos on top of the template (transparent areas allow photos to show through)

The photo capture logic in `PhotoCapture.jsx` handles:
1. Displaying camera feed with 596:626 aspect ratio preview
2. Showing visual frame overlay indicating exact capture area
3. Capturing only the content within the 596:626 frame
4. Ensuring captured photos match template cell dimensions

## Customization

To modify the grid layout:
- Edit the `compositePhotosWithTemplate` function in `Photobooth.jsx`
- Adjust the header/footer percentage calculations (currently 15% each)
- Modify the `positions` array for different photo arrangements
- Update this documentation to reflect any changes