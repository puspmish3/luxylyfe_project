# Footer Content Management Guide

## Overview

The Footer Content Management System allows administrators to dynamically manage all footer content through the admin interface, including navigation links, services, contact information, and legal links.

## Footer Sections

### 1. NAVIGATION Section

**Purpose:** Manage main site navigation links
**Section Type:** `NAVIGATION`
**Content Format:** JSON array of link objects

```json
[
  { "title": "Home", "url": "/" },
  { "title": "Projects", "url": "/projects" },
  { "title": "Contact", "url": "/contact-us", "isExternal": false }
]
```

### 2. SERVICES Section

**Purpose:** Manage service offerings and links
**Section Type:** `SERVICES`
**Content Format:** JSON array of service objects

```json
[
  { "title": "Luxury Property Sales", "url": "#" },
  { "title": "Property Management", "url": "/services/management" },
  {
    "title": "Investment Consulting",
    "url": "https://external-site.com",
    "isExternal": true
  }
]
```

### 3. CONTACT_INFO Section

**Purpose:** Manage company contact information
**Section Type:** `CONTACT_INFO`
**Content Format:** JSON object with contact details

```json
{
  "address": "123 Luxury Avenue\nBeverly Hills, CA 90210",
  "phone": "(555) 123-4567",
  "email": "info@luxylyfe.biz"
}
```

### 4. LEGAL Section

**Purpose:** Manage legal and policy links
**Section Type:** `LEGAL`
**Content Format:** JSON array of legal link objects

```json
[
  { "title": "Privacy Policy", "url": "/privacy" },
  { "title": "Terms of Service", "url": "/terms" },
  { "title": "Cookie Policy", "url": "/cookies" }
]
```

## Admin Interface Usage

### Accessing Footer Management

1. Login as Admin/SuperAdmin
2. Navigate to Admin Dashboard
3. Click "Content Management"
4. Select "FOOTER" from the page type dropdown

### Adding New Footer Content

1. Click "Add Content" button
2. Set Page Type to "FOOTER"
3. Choose appropriate Section Type:
   - `NAVIGATION` - Site navigation links
   - `SERVICES` - Service offerings
   - `CONTACT_INFO` - Contact details
   - `LEGAL` - Legal/policy links
4. Enter title (section heading)
5. Enter content as JSON (see formats above)
6. Set display order
7. Ensure "Active" is checked
8. Click "Create"

### Editing Existing Footer Content

1. Find the footer section you want to edit
2. Click "Edit" button
3. Modify title, content, or order as needed
4. Click "Update"

### Content Format Examples

#### Navigation Links

```json
[
  { "title": "Home", "url": "/" },
  { "title": "About", "url": "/about-us" },
  { "title": "External Link", "url": "https://example.com", "isExternal": true }
]
```

#### Services

```json
[
  { "title": "Service Name", "url": "/service-page" },
  {
    "title": "External Service",
    "url": "https://external.com",
    "isExternal": true
  }
]
```

#### Contact Information

```json
{
  "address": "Street Address\nCity, State ZIP",
  "phone": "(555) 123-4567",
  "email": "contact@company.com"
}
```

#### Legal Links

```json
[
  { "title": "Privacy Policy", "url": "/privacy" },
  { "title": "Terms", "url": "/terms" }
]
```

## Technical Implementation

### Data Flow

1. Admin creates/edits footer content via CMS
2. Content stored in `PageContent` table with `pageType: 'FOOTER'`
3. Footer component fetches content on page load
4. Content parsed and rendered dynamically

### Content Parsing

- **Links:** JSON arrays parsed into clickable links
- **Contact Info:** JSON object parsed into formatted contact display
- **External Links:** Links with `isExternal: true` open in new tabs

### Fallback Behavior

If CMS content is not available, the footer falls back to hardcoded default content to ensure the site remains functional.

### Performance Considerations

- Footer content is fetched once per page load
- Content is cached by Next.js
- Loading state shows skeleton while fetching
- Graceful error handling with fallbacks

## Best Practices

### Content Management

1. **Use descriptive titles** for each section
2. **Maintain consistent ordering** across sections
3. **Test links** before publishing
4. **Use JSON format** for structured content
5. **Keep contact info current**

### Link Management

1. **Internal links** should use relative paths (`/about`)
2. **External links** should include full URLs and `isExternal: true`
3. **Broken links** are better than missing content - use `#` if needed
4. **Consistent naming** across all footer sections

### JSON Format Guidelines

1. **Validate JSON** before saving (proper quotes, commas, brackets)
2. **Use arrays** for multiple items (links, services)
3. **Use objects** for structured data (contact info)
4. **Include optional fields** like `isExternal` when needed

## Troubleshooting

### Common Issues

1. **Invalid JSON:** Ensure proper formatting with quotes and commas
2. **Missing content:** Check if content is marked as "Active"
3. **Links not working:** Verify URL format and external flag
4. **Layout issues:** Check display order values

### Testing Changes

1. Save content in admin interface
2. Refresh any page to see footer changes
3. Test all links for functionality
4. Verify mobile responsiveness

## Database Schema

```sql
-- PageContent table structure for footer content
{
  pageType: 'FOOTER',
  sectionType: 'NAVIGATION' | 'SERVICES' | 'CONTACT_INFO' | 'LEGAL',
  title: string,        -- Section heading
  content: string,      -- JSON formatted content
  order: number,        -- Display order
  isActive: boolean     -- Visibility flag
}
```

## Future Enhancements

### Potential Features

1. **Visual link editor** instead of JSON input
2. **Link validation** and broken link detection
3. **Social media links** section
4. **Footer template** selection
5. **Multi-language** footer support
6. **Footer analytics** and click tracking
