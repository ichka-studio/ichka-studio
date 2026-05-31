# 🗂️ J'ai récupéré mes 18 700 prompts Midjourney en 10 secondes — voici la méthode que personne ne documente correctement

*Par ICHKA Studio*

---

## Le problème que tout le monde rencontre

Tu as des centaines — voire des milliers — de prompts Midjourney qui dorment dans ton historique. Ton meilleur travail, tes formules qui marchent, tes paramètres affinés sur des mois.

Et un jour tu veux **tout récupérer**. Pour archiver, analyser, réutiliser, construire une base de données, entraîner un workflow.

Tu cherches un bouton « Exporter ».

Il n'existe pas.

Midjourney n'offre **aucun export officiel** de l'historique des prompts. Zéro. Et c'est là que commence la galère, parce que toutes les solutions que tu vas trouver en cherchant sont… mortes.

---

## Pourquoi toutes les méthodes « recommandées » échouent en 2026

J'ai perdu **2 heures** à essayer les solutions que tout le monde recommande. Voici pourquoi aucune ne marche aujourd'hui :

**❌ L'extension Chrome « Midjourney Archive Downloader »**
La plus citée sur les forums. Sauf qu'elle dépend de `legacy.midjourney.com`, un domaine qui **n'existe plus** en 2026. Résultat : elle reste bloquée sur `[0/X]` et ne télécharge jamais rien.

**❌ Le script Python `soxofaan/midjourney-archiver`**
Le repo GitHub de référence pour les plus techniques. Mais son auteur l'a **archivé le 30 juin 2025**. Plus aucune maintenance, plus à jour avec l'infrastructure actuelle de Midjourney.

**❌ Le scraping du DOM via la console**
L'idée naturelle : ouvrir F12 et récupérer les prompts directement dans la page. Sauf que Midjourney utilise la **virtualisation** — seuls ~4 prompts sont réellement présents dans le DOM à un instant T. Le reste n'existe pas tant que tu ne scrolles pas.

> Test rapide pour le constater :
> ```javascript
> document.querySelectorAll('span.relative').length
> // → renvoie 4. Pas 18 700. Quatre.
> ```

**Conclusion :** scraper la page est une impasse. Il faut parler directement à **l'API interne** de Midjourney — la même que le site utilise pour t'afficher tes images.

---

## La méthode qui fonctionne (et qui prend 10 secondes)

L'idée : appeler directement l'endpoint `https://www.midjourney.com/api/imagine` depuis ta propre console, **avec ta propre session connectée**. Tu ne « hackes » rien — tu récupères tes propres données via le même canal que le site.

Le seul piège : un header d'authentification précis sans lequel l'API te claque la porte au nez (401).

Bonne nouvelle : aucune compétence de dev requise. Si tu sais ouvrir F12, tu sais le faire.

### Étape par étape

**1.** Va sur `https://www.midjourney.com/create` en étant **connecté**.

**2.** Ouvre les outils de développement : **F12** → onglet **Network** (Réseau) → active le filtre **Fetch/XHR**.

**3.** Vide la liste (**Ctrl+L**), recharge la page (**F5**), puis scrolle un peu pour déclencher du trafic.

**4.** Trie les requêtes par colonne **« Size »** (Taille), du plus grand au plus petit.

**5.** Repère la requête `imagine?user_id=...` — c'est la plus grosse de la liste (souvent **1 Mo et plus**).

**6.** Clic droit dessus → **« Copy as fetch »** (Copier au format fetch).

**7.** Colle-la dans la console pour inspecter ses headers. Celui qui compte :
```
x-csrf-protection: 1
```
👉 Sans ce header, l'API renvoie **401 Unauthorized**. C'est *le* détail qui fait tout planter chez la plupart des gens.

**8.** Note ton **`user_id`** — il est visible directement dans l'URL de la requête.

**9.** Lance le script ci-dessous dans la console.

---

## Le script (prêt à copier-coller)

> ⚠️ Remplace `REMPLACER_PAR_TON_USER_ID` par ton vrai `user_id` (étape 8). Ne le partage jamais publiquement — c'est l'identifiant de ton compte.

```javascript
(async () => {
  const USER_ID = 'REMPLACER_PAR_TON_USER_ID';
  let allJobs = [];
  let cursor = null;
  let page = 1;

  while (true) {
    const url = `https://www.midjourney.com/api/imagine?user_id=${USER_ID}&page_size=10000${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;

    const response = await fetch(url, {
      headers: {
        "accept": "*/*",
        "content-type": "application/json",
        "x-csrf-protection": "1"
      },
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) { console.error(`Erreur HTTP ${response.status}`); break; }

    const data = await response.json();
    const jobs = data.data || [];
    console.log(`Page ${page} → ${jobs.length} jobs (total: ${allJobs.length + jobs.length})`);

    allJobs.push(...jobs);
    cursor = data.cursor;
    if (!cursor || jobs.length === 0) break;
    page++;
    await new Promise(r => setTimeout(r, 500));
    if (page > 20) break;
  }

  // Téléchargement 1 — JSON brut complet (toutes les données)
  const jsonBlob = new Blob([JSON.stringify(allJobs, null, 2)], {type: 'application/json'});
  const a1 = document.createElement('a');
  a1.href = URL.createObjectURL(jsonBlob);
  a1.download = `midjourney_FULL_${new Date().toISOString().split('T')[0]}.json`;
  a1.click();

  // Téléchargement 2 — TXT lisible (juste prompts + date)
  await new Promise(r => setTimeout(r, 500));
  const txtContent = allJobs.map((job, i) => {
    const prompt = job.full_command || '(prompt non trouvé)';
    const date = job.enqueue_time || '';
    return `[${i+1}] ${date}\n${prompt}`;
  }).join('\n\n---\n\n');

  const txtBlob = new Blob([txtContent], {type: 'text/plain'});
  const a2 = document.createElement('a');
  a2.href = URL.createObjectURL(txtBlob);
  a2.download = `midjourney_PROMPTS_${new Date().toISOString().split('T')[0]}.txt`;
  a2.click();

  console.log(`✅ ${allJobs.length} jobs récupérés`);
})();
```

**Ce que fait le script, en clair :**
- Il interroge l'API page par page (10 000 jobs max par appel) et tourne la pagination tout seul grâce au champ `cursor` de la réponse.
- Une pause de 500 ms entre chaque appel = on reste poli avec le serveur.
- Une sécurité à 20 pages pour éviter toute boucle infinie.
- À la fin, il te télécharge **deux fichiers** : le JSON complet (tout) + un TXT lisible (juste tes prompts datés).

---

## Ce que tu récupères pour chaque image

Le JSON est une mine. Pour chaque job, tu obtiens notamment :

- `full_command` → **le prompt complet**, avec tous tes paramètres (`--ar`, `--chaos`, `--stylize`, `--v`, `--profile`…)
- `enqueue_time` → la **date**
- `id`, `job_type`, `batch_size`, `width`, `height`
- `rating`, `published`, `shown`
- `user_hash`, `template`, `personalization_codes`

Autrement dit : de quoi reconstruire l'intégralité de ta pratique, l'analyser, ou la transformer en base de données exploitable.

---

## Le résultat

- **18 700 prompts** récupérés.
- **~10 secondes** d'exécution.
- À comparer aux **2 heures** d'essais ratés avec les méthodes obsolètes.

Une API renvoie jusqu'à 10 000 jobs par appel, la pagination fait le reste, et tout finit dans deux fichiers propres sur ton disque.

---

## Pourquoi c'est important

Tes prompts, c'est ton travail. Ta signature. Des mois d'itérations. Ne pas pouvoir les exporter, c'est accepter qu'ils restent prisonniers d'une interface. Cette méthode te rend la main sur **tes propres données**.

---

**Tu testes des outils, des workflows et des méthodes pour créateurs IA ?**
C'est exactement ce qu'on documente chez **ICHKA Studio** — générateurs de prompts, workflows génératifs et techniques concrètes, sans bullshit.

👉 Suis ICHKA Studio pour la suite.
