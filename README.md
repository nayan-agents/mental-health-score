# 🧠 Student Mental Health Score Prediction

An end-to-end **Machine Learning project** that predicts a student's **mental health score on a 0–10 scale** using demographic, academic, lifestyle, social-media usage, sleep, physical activity, and stress-related factors.

The trained **Random Forest Regression** model is integrated with a **FastAPI backend**, allowing a frontend application to send student information and receive a real-time predicted mental health score.

> **Disclaimer:** This project is intended for educational and demonstration purposes only. The prediction is not a medical diagnosis or clinical assessment.

---

## 📌 Project Overview

Student mental health can be influenced by several aspects of daily life, including social-media usage, sleep, physical activity, study habits, and stress.

This project explores these factors using a dataset containing **5,000 student records** and builds a regression model capable of predicting the `Mental_Health_Score`.

The complete workflow includes:

**Data → EDA → Data Cleaning → Feature Engineering → Preprocessing → Model Training → Evaluation → Model Deployment → API Prediction**

---

## 📊 Dataset

The dataset contains **5,000 records and 13 columns**.

### Features

| Feature                   | Description                                 |
| ------------------------- | ------------------------------------------- |
| `Age`                     | Student age                                 |
| `Gender`                  | Student gender                              |
| `Country`                 | Student's country                           |
| `Academic_Level`          | Academic level                              |
| `Most_Used_Platform`      | Most frequently used social-media platform  |
| `Purpose_Of_Use`          | Main purpose of social-media usage          |
| `Avg_Daily_Usage_Hours`   | Average daily social-media usage            |
| `Daily_Unlocks`           | Number of daily device/social-media unlocks |
| `Study_Hours`             | Daily study hours                           |
| `Physical_Activity_Hours` | Physical activity hours                     |
| `Sleep_Hours_Per_Night`   | Average sleep per night                     |
| `Stress_Level`            | Reported stress level                       |
| `Mental_Health_Score`     | Target variable                             |

The target variable is `Mental_Health_Score`.

The available dataset values range from **3.6 to 9.4**, while the project treats the score as a **0–10 scale**.

---

## 🔎 Exploratory Data Analysis

The project includes exploratory analysis of:

* Target variable distribution
* Numerical feature correlations
* Stress level vs. mental health score
* Social-media usage vs. mental health score
* Sleep duration vs. mental health score
* Social-media platform distribution
* Numerical feature outliers
* Feature skewness
* Categorical feature distributions

---

## 🧹 Data Cleaning

The following cleaning steps were performed:

* Checked for duplicate records
* Removed duplicate rows
* Checked numerical features for outliers
* Checked feature skewness
* Corrected unrealistic negative values in `Physical_Activity_Hours` by clipping them at zero

---

## ⚙️ Feature Engineering

The dataset contains **111 unique countries**.

To reduce the number of categorical values, countries were grouped into the **10 most frequent countries**, with the remaining countries categorized as `Other`.

The resulting country groups are:

* India
* USA
* Canada
* Australia
* UK
* Germany
* Mexico
* Turkey
* France
* Other

This grouped feature is used during model training and prediction.

---

## 🔄 Data Preprocessing

A Scikit-learn `ColumnTransformer` and multiple pipelines were used to preprocess the features.

### Numerical Features

`Study_Hours` was treated as a skewed feature and processed using:

* `log1p` transformation
* `StandardScaler`

Other numerical features were standardized using `StandardScaler`.

### Ordinal Feature

`Stress_Level` was treated as an ordinal feature using:

```text
Low → Medium → High → Very High
```

and encoded using `OrdinalEncoder`.

### Categorical Features

The following nominal categorical features were encoded using `OneHotEncoder`:

* Gender
* Academic Level
* Most Used Platform
* Purpose of Use
* Grouped Countries

The encoder uses `handle_unknown='ignore'` to handle unseen categories.

---

## 🤖 Machine Learning Models

Two regression approaches were evaluated.

### 1. Linear Regression

Linear Regression was used as the baseline model.

**Test Results:**

* R²: **0.7398**
* MAE: **0.5362**
* RMSE: **0.6760**

### 2. Random Forest Regression

Random Forest Regression was then used to capture nonlinear relationships between the features and the mental health score.

**Test Results:**

* R²: **0.8776**
* MAE: **0.3472**
* RMSE: **0.4637**

The Random Forest model performed substantially better than the Linear Regression baseline.

---

## 🎯 Hyperparameter Tuning

`RandomizedSearchCV` with **5-fold cross-validation** was used to search for better Random Forest hyperparameters.

The search included:

* Number of estimators
* Maximum tree depth
* Minimum samples required for splitting
* Minimum samples required at a leaf

The selected parameters were:

```text
n_estimators = 200
max_depth = 15
min_samples_split = 5
min_samples_leaf = 2
```

However, the tuned model performed slightly worse on the held-out test set than the default Random Forest.

Therefore, the model saved and deployed by this project is the **default Random Forest pipeline**.

---

## 📈 Model Comparison

| Model                 |    Test R² |        MAE |       RMSE |
| --------------------- | ---------: | ---------: | ---------: |
| Linear Regression     |     0.7398 |     0.5362 |     0.6760 |
| Random Forest         | **0.8776** | **0.3472** | **0.4637** |
| Random Forest (Tuned) |     0.8650 |     0.3689 |          — |

### Best Performing Model

**Random Forest Regression**

The default Random Forest achieved an **R² score of approximately 0.878** on the test set.

---

## 🚀 Model Deployment

The trained model is serialized using **Joblib** and integrated into a **FastAPI** backend.

The API loads the trained model when the application starts and exposes a prediction endpoint.

```python
model = joblib.load('Mental_Health_Model.pkl')
```

## The backend accepts validated student information through a Pydantic model and converts the request into the feature structure expected by the trained model.

## 🔌 API Endpoint

### `POST /predict`

The endpoint accepts:

```text
Age
Gender
Country
Academic Level
Most Used Platform
Purpose of Use
Average Daily Usage Hours
Daily Unlocks
Study Hours
Physical Activity Hours
Sleep Hours Per Night
Stress Level
```

The backend also performs validation on several inputs, such as age, usage hours, study hours, physical activity, and sleep hours.

### Example Response

```json
{
  "predicted_mental_health_score": 6.42
}
```

The prediction is rounded to two decimal places before being returned by the API.

---

## 🛠️ Tech Stack

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* Joblib
* Matplotlib
* Seaborn

### Backend

* FastAPI
* Pydantic
* Uvicorn

### Frontend

* HTML
* CSS
* JavaScript

---

## 📁 Project Structure

```text
Mental-Health-Score-Prediction/
│
├── main.py
├── ML_Project.ipynb
├── Mental_Health_Model.pkl
├── Student Social Media And Mental Health Impact.csv
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Navigate into the project:

```bash
cd Mental-Health-Score-Prediction
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

The backend requirements include FastAPI, Uvicorn, Pydantic, Joblib, Pandas, NumPy, and Scikit-learn.

---

## ▶️ Run the Backend

Start the FastAPI server using:

```bash
uvicorn main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation can be accessed at:

```text
http://127.0.0.1:8000/docs
```

---

## 🔗 Application Architecture

```text
                 User
                   │
                   ▼
             Frontend UI
                   │
                   │ HTTP POST /predict
                   ▼
             FastAPI Backend
                   │
                   ▼
          Pydantic Validation
                   │
                   ▼
        Feature Preparation
                   │
                   ▼
       Preprocessing Pipeline
                   │
                   ▼
       Random Forest Regressor
                   │
                   ▼
       Mental Health Score
              (0–10 scale)
                   │
                   ▼
             Frontend UI
```

---

## 🎯 Key Learning Outcomes

Through this project, I implemented:

* Exploratory Data Analysis
* Data cleaning
* Outlier analysis
* Skewness analysis
* Feature engineering
* Numerical feature scaling
* Log transformation
* Ordinal encoding
* One-hot encoding
* ColumnTransformer
* Scikit-learn Pipelines
* Train-test splitting
* Regression modeling
* Model comparison
* Hyperparameter tuning
* Cross-validation
* Model evaluation using R², MAE and RMSE
* Model serialization with Joblib
* FastAPI REST API development
* Pydantic data validation
* Frontend-backend integration

---

## ⚠️ Disclaimer

This project is developed for **educational and demonstration purposes**.

The predicted mental health score is generated from the dataset and trained Machine Learning model. It should **not be interpreted as a medical diagnosis, psychological assessment, or substitute for professional mental-health advice**.
