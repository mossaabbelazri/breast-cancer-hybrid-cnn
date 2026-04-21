import matplotlib.pyplot as plt
import numpy as np
import os

# --- Données du compte-rendu ---
classes = ['Benign', 'Malignant', 'Normal']
precision = [0.93, 0.94, 1.00]
recall = [0.92, 0.95, 1.00]
f1_score = [0.93, 0.94, 1.00]
support = [2174, 2742, 405]

# Style de base
plt.style.use('ggplot')

# ==========================================
# GRAPHIQUE 1 : Histogramme des métriques
# ==========================================
plt.figure(figsize=(10, 6))
x = np.arange(len(classes))
width = 0.25  # Largeur des barres

fig, ax = plt.subplots(figsize=(10, 6))
rects1 = ax.bar(x - width, precision, width, label='Précision', color='#3498db')
rects2 = ax.bar(x, recall, width, label='Rappel (Recall)', color='#2ecc71')
rects3 = ax.bar(x + width, f1_score, width, label='F1-Score', color='#e74c3c')

# Textes et labels
ax.set_ylabel('Scores', fontweight='bold', fontsize=12)
ax.set_title("Performances Métriques par Classe (Modèle Hybride VGG16-SVM)", fontweight='bold', fontsize=14, pad=20)
ax.set_xticks(x)
ax.set_xticklabels(classes, fontsize=12, fontweight='bold')
ax.legend(loc='lower right')
ax.set_ylim(0.8, 1.05) # Zoomer sur le haut pour mieux voir la différence

# Ajouter les valeurs exactes au-dessus des barres
def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height:.2f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=10)

autolabel(rects1)
autolabel(rects2)
autolabel(rects3)

path1 = os.path.join(os.path.dirname(__file__), "metriques_bar_chart.png")
plt.savefig(path1, dpi=300, bbox_inches='tight')
plt.close(fig)

# ==========================================
# GRAPHIQUE 2 : Répartition des Données (Camembert)
# ==========================================
plt.figure(figsize=(8, 8))
colors = ['#f1c40f', '#e74c3c', '#2ecc71']
explode = (0.05, 0.05, 0.05)

plt.pie(support, labels=classes, colors=colors, autopct='%1.1f%%', startangle=140, pctdistance=0.85, explode=explode, textprops={'fontsize': 14, 'weight': 'bold'})
# Pour faire un joli diagramme en anneau (Donut Chart)
centre_circle = plt.Circle((0,0),0.70,fc='white')
fig = plt.gcf()
fig.gca().add_artist(centre_circle)

plt.title("Répartition des 5321 Images de Test\n(% du Support Dataset)", fontweight='bold', fontsize=16)

path2 = os.path.join(os.path.dirname(__file__), "repartition_donnees_pie.png")
plt.savefig(path2, dpi=300, bbox_inches='tight')
plt.close()

print("Graphiques générés avec succès sans erreur de caractères.")
