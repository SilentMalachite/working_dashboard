# Working Dashboard Specification

## Dashboard Structure

### Overall Dashboard Composition

- The dashboard consists of multiple work items and multiple name tags.
- Each work item can have its name changed dynamically.
- Name tags can have any name or label entered freely (e.g., employee names or identifiers).
- Name tags should be pre-placed on the dashboard canvas for easy access and manipulation.

### Work Item Details

- Each individual work item includes stages: First (initial assignment), Double Check (review), and Final Confirmation (approval), in that sequential order.
- Place arrow icons or markers between each stage to visually indicate progression (e.g., First → Double Check → Final Confirmation).
- Allow each work item to be freely color-coded for visual distinction (e.g., via CSS classes or inline styles).
- Work items are grouped logically; enable reordering of these groups vertically (up/down) via drag-and-drop or buttons to adjust sequence.

### Name Tag Details

- Name tags should be freely color-coded to match teams, roles, or preferences (e.g., via CSS or attributes).
- Individual name tags can be dragged and dropped onto specific work item groups to assign personnel to tasks dynamically.

## Technical Requirements

- Implement the dashboard using only HTML, CSS, and vanilla JavaScript (no external frameworks or libraries required).
- Ensure the entire application runs as a single HTML file for easy deployment and execution (embed all CSS and JS inline or in `<style>` and `<script>` tags).
- Use HTML5 elements (e.g., `<div>` for work items and name tags, `<canvas>` or DOM manipulation for layout if needed).
- Handle interactions like drag-and-drop with the HTML5 Drag and Drop API or mouse event listeners for compatibility.
- The dashboard should be responsive and work in modern web browsers without server-side dependencies.

## Please set the display and input language to Japanese.
