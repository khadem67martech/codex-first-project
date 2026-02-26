# ROAS Calculator (GitHub Pages)

A beginner-friendly ROAS calculator built with plain HTML, CSS, and JavaScript.

## Features

- Add channel rows with **Channel, Cost, Revenue, and ROAS**
- Inline validation messages (no browser alerts)
- **Edit** and **Delete** actions per row
- **Sort by ROAS** toggle (descending/ascending)
- Totals under the table:
  - Total Cost
  - Total Revenue
  - Overall ROAS (total revenue / total cost)
- Press **Enter** in any input to quickly add a row
- **Copy Summary** button for:
  - `Best: <channel> (ROAS=..), Worst: <channel> (ROAS=..), Total ROAS=..`
- **Export CSV** button for the current table order

## File structure

- `index.html` - page structure and UI sections
- `styles.css` - styling for layout, buttons, table, totals, and summary
- `app.js` - calculator logic, validation, editing, sorting, totals, copy summary, and CSV export

## How to use

1. Open `index.html` in your browser.
2. Enter a channel name, cost, and revenue.
3. Click **Add row** or press **Enter** in any input field.
4. Use the row buttons:
   - **Edit** to update a row inline, then **Save** or **Cancel**
   - **Delete** to remove a row
5. Click **Sort by ROAS** to switch between descending and ascending order.
6. Review totals and best/worst channel summary.
7. Click:
   - **Copy Summary** to copy the summary text to clipboard
   - **Export CSV** to download the current table as `roas-table.csv`
