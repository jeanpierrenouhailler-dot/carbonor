# Protocole de Tests & Validation Scientifique

## 1. Tests Numériques Fondamentaux

### A. Loi de Beer-Lambert
Pour une cuve de $L = 0$ m ou une concentration de $0$ ppm :
$$\tau(\nu) = 0 \implies T(\nu) = 1.0 \ (100\%)$$
Au centre de la bande 15 µm sous 420 ppm et 100 m :
$$\tau(667.38\text{ cm}^{-1}) > 50 \implies T(667.38\text{ cm}^{-1}) \approx 0.0$$

### B. Conversions d'Unités Exactes
- $\lambda = 15.0\text{ µm} \iff \nu = \frac{10000}{15.0} = 666.667\text{ cm}^{-1}$
- $\nu = 667.38\text{ cm}^{-1} \iff f = 2.99792458 \times 10^{-2} \times 667.38 = 20.0075\text{ THz}$
- $1.0\ \mu\text{mol}/(\text{m}^2\cdot\text{s}) \iff 1.03775\text{ gC}/(\text{m}^2\cdot\text{jour})$

### C. Validation Statistique
- Biais identique à $\bar{M} - \bar{O}$
- Corrélation $r \in [-1, 1]$

## 2. Validation TypeScript et Linting
Exécutez :
```bash
npm run lint
```
Vérifie la stricte conformité des types et l'absence d'erreurs d'import.
