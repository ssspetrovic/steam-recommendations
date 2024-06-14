import matplotlib.pyplot as plt
import numpy as np

# Podaci za vreme izvršavanja sa i bez indeksa
execution_time_without_indices = [99999, 99999, 99999, 99999, 99999]
execution_time_with_indices = [
    3475, 4158, 6640, 3216, 1033]

# Podaci za restrukturirano vreme izvršavanja sa i bez indeksa
restructured_without_indices = [3543, 9374, 99999, 99999, 99999]
restructured_with_indices = [274, 3837, 5651, 3169, 1002]

# Imena upita
queries = ['Query 1', 'Query 2', 'Query 3', 'Query 4', 'Query 5']

# Indeksi za svaki upit
indices = np.arange(len(queries))

# Širina bara
bar_width = 0.2

# Pomeraj za svaku dodatnu informaciju
offsets = [-1.5 * bar_width, -0.5 * bar_width,
           0.5 * bar_width, 1.5 * bar_width]

# Kreiranje figure i osa
fig, ax = plt.subplots(figsize=(14, 8))

# Define the colors for each execution type
colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']

# Dodavanje barova za vreme izvršavanja sa i bez indeksa, restrukturirano vreme izvršavanja sa i bez indeksa za svaki upit
for i, query in enumerate(queries):
    ax.bar(indices[i] + offsets[0], execution_time_without_indices[i],
           bar_width, color=colors[0], edgecolor='grey')
    ax.bar(indices[i] + offsets[1], execution_time_with_indices[i],
           bar_width, color=colors[1], edgecolor='grey')
    ax.bar(indices[i] + offsets[2], restructured_without_indices[i],
           bar_width, color=colors[2], edgecolor='grey')
    ax.bar(indices[i] + offsets[3], restructured_with_indices[i],
           bar_width, color=colors[3], edgecolor='grey')

    # Dodavanje brojeva iznad svakog bara
    ax.text(indices[i] + offsets[0], execution_time_without_indices[i] + 1000, 'unknown' if execution_time_without_indices[i]
            == 99999 else str(execution_time_without_indices[i]), ha='center', va='bottom')
    ax.text(indices[i] + offsets[1], execution_time_with_indices[i] + 1000, 'unknown' if execution_time_with_indices[i]
            == 99999 else str(execution_time_with_indices[i]), ha='center', va='bottom')
    ax.text(indices[i] + offsets[2], restructured_without_indices[i] + 1000, 'unknown' if restructured_without_indices[i]
            == 99999 else str(restructured_without_indices[i]), ha='center', va='bottom')
    ax.text(indices[i] + offsets[3], restructured_with_indices[i] + 1000, 'unknown' if restructured_with_indices[i]
            == 99999 else str(restructured_with_indices[i]), ha='center', va='bottom')

# Dodavanje oznaka na osama i naslov
ax.set_xlabel('Queries')
ax.set_ylabel('Time Required (ms)')
ax.set_title('Query Performances')
ax.set_xticks(indices)
ax.set_xticklabels(queries)
ax.legend(['Without Indices', 'With Indices',
           'Restructured Without Indices', 'Restructured With Indices'])

# Prikazivanje grafikona
plt.tight_layout()
plt.show()
