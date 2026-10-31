"""Banking Products Dashboard - Flask app.

Data layer : data/products.json, served by a tiny mock JSON API (/api/...)
UI layer   : templates/index.html + static/app.js + static/style.css
The UI only talks to the API, so the data source can be swapped freely.
"""
import json
from pathlib import Path

from flask import Flask, abort, jsonify, render_template, request

BASE_DIR = Path(__file__).parent
app = Flask(__name__)


def load_products():
    with open(BASE_DIR / "data" / "products.json", encoding="utf-8") as f:
        return json.load(f)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/categories")
def categories():
    """Categories with product counts, in first-seen order."""
    counts = {}
    for p in load_products():
        counts[p["category"]] = counts.get(p["category"], 0) + 1
    return jsonify([{"name": n, "count": c} for n, c in counts.items()])


@app.get("/api/products")
def products():
    """Optional filters: ?category=Loans&status=Active&q=card"""
    category = request.args.get("category", "").strip().lower()
    status = request.args.get("status", "").strip().lower()
    q = request.args.get("q", "").strip().lower()

    result = []
    for p in load_products():
        if category and p["category"].lower() != category:
            continue
        if status and p["status"].lower() != status:
            continue
        if q:
            haystack = " ".join([p["name"], p["category"], p["description"]]).lower()
            if q not in haystack:
                continue
        result.append(p)
    return jsonify(result)


@app.get("/api/products/<product_id>")
def product_detail(product_id):
    for p in load_products():
        if p["id"] == product_id:
            return jsonify(p)
    abort(404, description="Product not found")


@app.errorhandler(404)
def not_found(err):
    if request.path.startswith("/api/"):
        return jsonify({"error": err.description}), 404
    return err

if __name__ == "__main__":
    app.run(debug=True, port=5000)
