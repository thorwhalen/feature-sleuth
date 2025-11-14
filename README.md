This educational game system uses **data-driven guessing** to teach users how to categorize and identify items based on their features, similar to a process of **Deductive Reasoning** or a simplified version of **20 Questions**.

---

## 🎮 The System: "Feature Sleuth" (A Working Title)

### 🌟 TL;DR Description

The system, which could be categorized as an **Educational Guessing Game** or **Data-Driven Feature Identification**, gamifies learning by challenging users to identify a specific item from a collection (a **dataset** or **item catalog**) based on incrementally revealed **feature characteristics**. The core mechanic involves selecting a feature (like color, size, or type) and then using a **random selector** (like a spinning wheel or dice) to narrow down the possible items. The goal is either to identify a single item or make a calculated guess from the remaining possibilities, with scoring rewarding efficient and accurate deduction.

---

## 🎯 Game Category and Lingo

This game falls under several related categories and employs concepts from game design, data science, and education:

* **Educational Guessing/Deduction Game:** The user employs logic and knowledge to eliminate possibilities and deduce the correct answer.
* **Feature Identification/Classification:** The process mirrors how algorithms classify objects based on their feature vector.
* **The 20 Questions Pattern:** The game uses a series of questions/selections to systematically narrow a large set of possibilities until the target is identified.
* **Entropy-Based Selection:** Mentioning the potential for the game to choose the next feature based on **entropy** (a measure of uncertainty) suggests a system that aims to select the feature that will provide the **maximum information gain** (i.e., the feature that, when split, best halves the remaining item set) to efficiently narrow the search.
* **Similar Games/Patterns:**
    * **20 Questions:** A classic example of deductive set reduction.
    * **Guess Who?:** Players systematically eliminate features (glasses, hat, hair color) until only one character remains.
    * **Mastermind:** While it uses features (colors/positions) and deduction, the feedback mechanism is different.
    * **Decision Tree Learning:** The structure of making a choice based on a feature value, which leads to a subset, strongly mirrors the node structure of a **Decision Tree** , where each feature split classifies the data.

---

## ⚙️ Core Mechanics and Game Forms

The system is defined by its data input and its interactive mechanics.

### 1. Data Input and Structure

| Component | Description | Example (for an animal learning app) |
| :--- | :--- | :--- |
| **Input Data** | A list/catalog of items, often structured as a **table** or **dataset**. | A catalog of animals. |
| **Identification Field(s)** | The unique label(s) for the item(s) the user must guess. | **Animal Name** (e.g., *Lion*, *Penguin*). |
| **Feature Field(s)** | The **attributes** or **characteristics** of the items used for selection. | **Habitat**, **Diet**, **Body Covering**. |
| **Feature Processing** | The method for transforming raw data into manageable choices for the random selector. | The numerical feature "Weight" is **bucketed** into {0-10kg: 60%, 10-100kg: 30%, 100+kg: 10%}. |

### 2. Gameplay Loop and Forms

The game can take on several distinct forms based on the required path to identification and the scoring logic. The core loop is:

1.  **Feature Selection:** A feature category is chosen (e.g., "Body Covering").
2.  **Random Selection:** The user spins the wheel to select a specific characteristic (e.g., "Feathers").
3.  **Set Reduction:** The item collection is filtered to include only items matching the selected characteristic.
4.  **Guess/Continue:** The user either makes a guess or selects the next feature to further reduce the item set.

| Game Form | Description | Guess/Scoring Logic |
| :--- | :--- | :--- |
| **Form A: Pure Deduction** | The user must continue selecting features until the remaining item set is $\mathbf{N=1}$. The user then guesses the final item. | **Win/Loss:** Scored on number of turns/features used (fewer turns is better).  |
| **Form B: Calculated Guess** | The user can guess at *any* point, even if $\mathbf{N > 1}$ items remain. | **Risk/Reward Scoring:** Points are weighted by $\mathbf{1/N}$. Higher points for a correct guess when fewer items remain (higher risk/difficulty). |
| **Form C: Multiple Choice** | The selection process reveals the matching set. The user must guess *all* items in the matching set or a percentage of them. | **Accuracy Score:** Scored on the ratio of correctly guessed items to the actual number of matching items. **Negative points** may be applied for guessing an item not in the set (a **false positive**). |

### 3. Scoring Considerations

The scoring system is crucial to driving the desired learning behavior.

* **Information Gain Bonus:** Awarding bonus points for selecting a feature that yields the greatest reduction in the item set (**high information gain**), even if that feature was randomly selected by the game.
* **Confidence Bonus:** In the "Calculated Guess" form, scoring can incorporate the user's *stated confidence* or the current set size ($N$). A higher score for correct guesses when $N$ is small incentivizes **knowledge**; a higher score when $N$ is large incentivizes **risk assessment**.
* **Time/Efficiency:** Punishing excessive steps promotes strategic thinking and efficient feature choice.
