# PartsFinder Pro - Data Voorbeelden

Dit document toont voorbeelden van de data structuren en export formaten.

## 📋 BOM (Bill of Materials) Voorbeeld

### Excel Output Preview (eerste 10 kolommen)

| PHYSICAL PRODUCT BREAKDOWN (PPB) | PPB DESCRIPTION | OEM PART NUMBER | NAME OF MANUFACTURER | CAGE CODE NO. OEM | SUBCONTRACTOR PART NUMBER | CAGE CODE NO. SUBCONTRACTOR | SPARE PART NAME | QTY PER ASSEMBLY | UNIT OF ISSUE |
|---|---|---|---|---|---|---|---|---|---|
| PPB-001 | Heating Element assembly for commercial kitchen equipment | HTR-0001 | Rational | A3K9L | | | Heating Element | 1 | EA |
| PPB-002 | Control Board assembly for commercial kitchen equipment | PCB-0002 | Rational | A3K9L | | | Control Board | 1 | EA |
| PPB-003 | Temperature Sensor assembly for commercial kitchen equipment | SNS-0003 | Rational | A3K9L | | | Temperature Sensor | 2 | EA |
| PPB-004 | Door Seal Gasket assembly for commercial kitchen equipment | GSK-0004 | Rational | A3K9L | | | Door Seal Gasket | 1 | SET |
| PPB-005 | Fan Motor Assembly assembly for commercial kitchen equipment | FAN-0005 | Rational | A3K9L | | | Fan Motor Assembly | 1 | EA |

### Aanvullende Kolommen (selectie)

| UNIT PRICE (EURO) | DELIVERY TIME (DAYS) | WEIGHT ITEM | MTBF | MTTR (HOURS) | SHELF LIFE (MONTHS) | HS CODE | COO |
|---|---|---|---|---|---|---|---|
| 234.56 | 25 | 2.3 | 5234 | 3 | 36 | 841923 | DE |
| 456.78 | 18 | 0.8 | 6789 | 4 | 48 | 853712 | IT |
| 89.45 | 12 | 0.2 | 8901 | 1 | 60 | 902134 | DE |
| 23.45 | 8 | 0.3 | 2345 | 1 | 24 | 401256 | CN |
| 567.89 | 32 | 4.5 | 7890 | 5 | 36 | 850156 | DE |

## 🚢 RSPL (Recommended Spare Parts List) Voorbeeld

### Excel Output Preview

| SPARE PART NAME | SUPPLIER PART NUMBER | CAGE CODE NO. SUPPLIER | QUANTITY PER ASSEMBLY | Pr/Cr/Con | NO. RECOM. 0-2 YEARS | NO. RECOM. 0-6 YEARS | UNIT OF ISSUE |
|---|---|---|---|---|---|---|---|
| Heating Element | HTR-0001 | A3K9L | 1 | Cr | 2 / 841923 / DE | 6 | EA |
| Control Board | PCB-0002 | A3K9L | 1 | Cr | 3 / 853712 / IT | 9 | EA |
| Temperature Sensor | SNS-0003 | A3K9L | 2 | Pr | 2 / 902134 / DE | 6 | EA |
| Door Seal Gasket | GSK-0004 | A3K9L | 1 | Con | 10 / 401256 / CN | 30 | SET |
| Fan Motor Assembly | FAN-0005 | A3K9L | 1 | Cr | 2 / 850156 / DE | 6 | EA |

### Aanvullende Kolommen

| REASON FOR SELECTION | DIMENSION ITEM (CM) | WEIGHT ITEM (KG) | SHELF LIFE (DAYS) | SPECIAL STORAGE | REPAIR LEVEL | REMARKS |
|---|---|---|---|---|---|---|
| Critical for operation | 25 x 15 x 8 | 2.30 | 1080 | N | ILM | Rational SCC 101 - Critical spare |
| Critical for operation | 18 x 12 x 3 | 0.80 | 1440 | N | DLM | Rational SCC 101 - Critical spare |
| Preventive maintenance | 8 x 5 x 3 | 0.20 | 1800 | N | OLM | Rational SCC 101 - Preventive spare |
| Regular consumable | 150 x 2 x 2 | 0.30 | 720 | Y | OLM | Rational SCC 101 - Consumable |
| Critical for operation | 28 x 22 x 18 | 4.50 | 1080 | N | ILM | Rational SCC 101 - Critical spare |

## 🔍 Analyse Data Structuur (JSON)

### Interne Data Structuur

```json
{
  "brand": "Rational",
  "model": "SCC 101",
  "source": "web-search",
  "timestamp": "2026-03-09T16:30:00.000Z",
  "parts": [
    {
      "partNumber": "HTR-0001",
      "name": "Heating Element",
      "description": "Heating Element assembly for commercial kitchen equipment",
      "type": "Cr",
      "quantity": 1,
      "critical": true,
      "supplier": "OEM Parts Supplier",
      "unitPrice": "234.56",
      "leadTime": 25,
      "weight": "2.30",
      "dimensions": "25 x 15 x 8"
    },
    {
      "partNumber": "PCB-0002",
      "name": "Control Board",
      "description": "Control Board assembly for commercial kitchen equipment",
      "type": "Cr",
      "quantity": 1,
      "critical": true,
      "supplier": "OEM Parts Supplier",
      "unitPrice": "456.78",
      "leadTime": 18,
      "weight": "0.80",
      "dimensions": "18 x 12 x 3"
    },
    {
      "partNumber": "SNS-0003",
      "name": "Temperature Sensor",
      "description": "Temperature Sensor assembly for commercial kitchen equipment",
      "type": "Pr",
      "quantity": 2,
      "critical": false,
      "supplier": "OEM Parts Supplier",
      "unitPrice": "89.45",
      "leadTime": 12,
      "weight": "0.20",
      "dimensions": "8 x 5 x 3"
    }
  ]
}
```

## 📊 Part Type Classificatie

### Type Definities

| Type Code | Naam | Gebruik | Recommended Qty (2yr) | Recommended Qty (6yr) |
|---|---|---|---|---|
| **Pr** | Preventive | Preventief onderhoud, geplande vervanging | 2 | 6 |
| **Cr** | Corrective | Kritieke onderdelen, faalrisico | 2-3 | 6-9 |
| **Con** | Consumable | Verbruiksartikelen, regelmatig gebruik | 10 | 30 |

### Voorbeelden per Type

#### Preventive (Pr)
- Filters (lucht, water, olie)
- Smeer en onderhoudsmiddelen
- Riemen en kabels
- Sensoren (niet-kritiek)

#### Corrective (Cr)
- Motoren en aandrijvingen
- Elektronica en PCB's
- Pompen en ventielen
- Verwarmingselementen
- Display panels

#### Consumable (Con)
- Afdichtingen en pakkingen
- Reinigingsmiddelen
- Slangen en fittingen
- Filters (regelmatig vervangen)
- Slijtagedelen

## 🏷️ Repair Level Classificatie

| Code | Naam | Betekenis | Locatie |
|---|---|---|---|
| **OLM** | Organizational Level Maintenance | Operationeel niveau | Aan boord / ter plaatse |
| **ILM** | Intermediate Level Maintenance | Intermediair niveau | Regionale werkplaats |
| **DLM** | Depot Level Maintenance | Depot niveau | Centrale werkplaats |
| **CLM** | Contractor Level Maintenance | Contractor niveau | OEM / Specialist |

## 📦 Unit of Issue Codes

| Code | Betekenis | Gebruik Voor |
|---|---|---|
| **EA** | Each | Individuele items |
| **SET** | Set | Sets van meerdere items |
| **PC** | Piece | Losse stukken |
| **KG** | Kilogram | Gewicht-gebaseerd |
| **M** | Meter | Lengte-gebaseerd |
| **L** | Liter | Volume-gebaseerd |

## 🌍 Country of Origin Codes (COO)

| Code | Land | Typisch Voor |
|---|---|---|
| **DE** | Duitsland | Hoogwaardige mechanica, elektronica |
| **IT** | Italië | Design items, food equipment |
| **FR** | Frankrijk | Specialistische apparatuur |
| **NL** | Nederland | Marine equipment |
| **SE** | Zweden | Industriële systemen |
| **US** | Verenigde Staten | Heavy-duty equipment |
| **CN** | China | Standaard componenten, consumables |
| **JP** | Japan | Elektronica, precisie |
| **KR** | Zuid-Korea | Elektronica |

## 📋 HS Code Voorbeelden (Douane)

| Code | Categorie | Omschrijving |
|---|---|---|
| **8419.xx.xxxx** | Industrial/Laboratory Equipment | Ovens, steamers, dryers |
| **8421.xx.xxxx** | Filtering/Purifying Machinery | Filters, water treatment |
| **8422.xx.xxxx** | Dishwashing Machinery | Dishwashers, washing equipment |
| **8481.xx.xxxx** | Taps, Valves | Control valves, solenoids |
| **8501.xx.xxxx** | Electric Motors | All types of motors |
| **8536.xx.xxxx** | Electrical Apparatus | Switches, relays, connectors |
| **8537.xx.xxxx** | Control Panels | Control boards, displays |
| **4016.xx.xxxx** | Rubber Articles | Gaskets, seals, hoses |

## 🔧 MTBF/MTTR Voorbeelden

### Mean Time Between Failures (MTBF)

| Component Type | Typical MTBF | Unit |
|---|---|---|
| Heating Elements | 3000-5000 | Hours |
| Electric Motors | 5000-8000 | Hours |
| Control Boards | 4000-7000 | Hours |
| Sensors | 6000-10000 | Hours |
| Mechanical Parts | 2000-4000 | Cycles |
| Consumables | 500-1000 | Hours |

### Mean Time To Repair (MTTR)

| Repair Level | Typical MTTR | Opmerkingen |
|---|---|---|
| OLM (Simple) | 1-2 hours | Ter plaatse reparatie |
| ILM (Medium) | 3-6 hours | Werkplaats reparatie |
| DLM (Complex) | 8-24 hours | Gespecialiseerde reparatie |
| CLM (Overhaul) | 24-72 hours | Complete revisie |

## 💶 Prijs Categorieën (Indicatief)

| Component Type | Prijs Range (EUR) | Voorbeelden |
|---|---|---|
| Kleine Consumables | €5 - €50 | Gaskets, seals, filters |
| Sensoren | €50 - €200 | Temperature, pressure sensors |
| Elektronica | €200 - €1000 | PCB's, displays, controls |
| Motoren | €300 - €1500 | Fan motors, pump motors |
| Grote Assemblies | €1000 - €5000 | Complete units, major components |

## 📐 Dimensie Voorbeelden

### Item Afmetingen (L x W x H in CM)

| Component Type | Typical Size | Opmerkingen |
|---|---|---|
| Small Parts | 5 x 5 x 2 | Seals, gaskets, small sensors |
| Medium Parts | 15 x 10 x 8 | Electronics, small motors |
| Large Parts | 30 x 25 x 20 | Motors, assemblies |
| Bulky Items | 50 x 40 x 30 | Large assemblies, panels |

### Gewicht (KG)

| Component Type | Typical Weight | Opmerkingen |
|---|---|---|
| Small Parts | 0.1 - 0.5 | Lightweight components |
| Medium Parts | 0.5 - 3 | Standard components |
| Large Parts | 3 - 10 | Motors, heavy assemblies |
| Heavy Items | 10+ | Very large components |

---

## 📝 Export Bestandsnamen

### Naamgeving Conventie

```
BOM_[Merk]_[Model]_[YYYY-MM-DD].xlsx
RSPL_[Merk]_[Model]_[YYYY-MM-DD].xlsx
```

### Voorbeelden

```
BOM_Rational_SCC101_2026-03-09.xlsx
BOM_Electrolux_AOS061EAH1_2026-03-09.xlsx
BOM_Convotherm_C4eD1010_2026-03-09.xlsx

RSPL_Rational_SCC101_2026-03-09.xlsx
RSPL_Hobart_FX10_2026-03-09.xlsx
RSPL_AltoShaam_714ESG_2026-03-09.xlsx
```

---

**Gebruik deze voorbeelden als referentie voor je eigen analyses!** 📊
