"""Random Forest / SVM / Decision Tree comparison with scikit-learn on tabular biodiversity data."""
import io
import json
from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

SNAPSHOT = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'gbif-snapshot.json'
MAX_ROWS = 50_000


def snapshot_frame():
    d = json.loads(SNAPSHOT.read_text(encoding='utf-8'))
    rows = [
        {'region': r['name'], 'class': p.get('cls') or 'Unknown', 'lat': p['lat'], 'lon': p['lon'],
         'year': p.get('year'), 'iucn': p['iucn']}
        for r in d['regions'] for p in r['points']
    ]
    return pd.DataFrame(rows)


def read_csv(raw):
    df = pd.read_csv(io.BytesIO(raw))
    if len(df) > MAX_ROWS:
        df = df.sample(MAX_ROWS, random_state=42)
    return df


def target_candidates(df):
    out = []
    for c in df.columns:
        n = df[c].nunique(dropna=True)
        if 2 <= n <= 12 and df[c].value_counts().min() >= 2:
            out.append(str(c))
    return out


def run(df, target):
    if target not in df.columns:
        raise ValueError(f'Column "{target}" is not in the data.')
    df = df.dropna(subset=[target]).copy()
    y = df[target].astype(str)
    counts = y.value_counts()
    if counts.size < 2:
        raise ValueError('The target column needs at least two different values.')
    if counts.size > 12:
        raise ValueError('The target column has too many distinct values. Pick a category column such as status or type.')
    keep = counts[counts >= 2].index
    mask = y.isin(keep)
    df, y = df[mask], y[mask]
    if len(df) < 30:
        raise ValueError('Need at least 30 usable rows to train and test.')

    X = df.drop(columns=[target])
    num, cat = [], []
    for c in X.columns:
        if pd.api.types.is_numeric_dtype(X[c]):
            if X[c].notna().any():
                num.append(c)
        elif X[c].nunique() <= 30:
            cat.append(c)
    if not num and not cat:
        raise ValueError('No usable feature columns. Need numbers or short category columns besides the target.')
    X = X[num + cat].copy()
    for c in num:
        X[c] = X[c].fillna(X[c].median())
    for c in cat:
        X[c] = X[c].fillna('missing').astype(str)

    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    def pre():
        return ColumnTransformer([
            ('num', StandardScaler(), num),
            ('cat', OneHotEncoder(handle_unknown='ignore'), cat),
        ])

    models = {
        'Random Forest': RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1),
        'SVM': SVC(kernel='rbf', random_state=42),
        'Decision Tree': DecisionTreeClassifier(max_depth=8, random_state=42),
    }
    labels = sorted(keep.tolist())
    results, importances = [], []
    for name, clf in models.items():
        pipe = Pipeline([('pre', pre()), ('clf', clf)]).fit(Xtr, ytr)
        pred = pipe.predict(Xte)
        results.append({
            'model': name,
            'accuracy': float(accuracy_score(yte, pred)),
            'precision': float(precision_score(yte, pred, average='macro', zero_division=0)),
            'recall': float(recall_score(yte, pred, average='macro', zero_division=0)),
            'f1': float(f1_score(yte, pred, average='macro', zero_division=0)),
            'confusion': confusion_matrix(yte, pred, labels=labels).tolist(),
        })
        if name == 'Random Forest':
            names = pipe.named_steps['pre'].get_feature_names_out()
            imp = pipe.named_steps['clf'].feature_importances_
            importances = sorted(
                [{'feature': str(n).split('__', 1)[-1], 'weight': float(w)} for n, w in zip(names, imp)],
                key=lambda d: -d['weight'])[:8]
    majority = yte.value_counts().idxmax()
    return {
        'target': target, 'labels': labels, 'features': num + cat,
        'rows': int(len(df)), 'train': int(len(Xtr)), 'test': int(len(Xte)),
        'baseline': float((yte == majority).mean()), 'baselineLabel': majority,
        'results': results, 'importances': importances,
    }
