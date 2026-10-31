# Banking Products Dashboard (Python / Flask)

A single-screen dashboard that shows Savings, Credit Card, Loan and Wealth products in one unified view.

## Tech choices
- **Python 3 + Flask**: serves the page and a tiny mock JSON API. No database; data is read from `data/products.json`.
- **Vanilla HTML/CSS/JS**: no build step. The UI fetches from the API and renders cards.

## Run it
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000

## Structure
```
app.py               Flask app + mock API
data/products.json   Product data (data layer)
templates/index.html Page shell
static/app.js        Rendering, filtering, detail dialog (UI layer)
static/style.css     Responsive styling
```

## API
| Endpoint | Description |
|---|---|
| `GET /api/products` | List products. Optional `category`, `status`, `q` query params |
| `GET /api/products/<id>` | One product |
| `GET /api/categories` | Categories with counts |

## Features
- Card per product: name, category, status, two key metrics, and a call-to-action (Apply now / Track application / View details)
- Category tabs, status filter and live search (they combine)
- Detail dialog opened by the call-to-action
- Responsive grid, keyboard-focus styles, empty and error states

Data and UI are separate: to use real data, change `load_products()` in `app.py`; the front end needs no change.
