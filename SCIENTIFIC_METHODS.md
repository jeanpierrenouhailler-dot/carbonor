# Méthodes Scientifiques & Formules Physiques

## 1. Loi de Beer-Lambert
L'atténuation du faisceau monochromatique traversant un milieu absorbant est régie par :
$$\tau(\nu) = \int_0^L k_\nu(s) \, ds$$
$$T(\nu) = e^{-\tau(\nu)}$$
$$A(\nu) = \tau(\nu) = -\ln(T(\nu))$$

Dans notre moteur, le coefficient d'absorption moléculaire volumique $k_\nu$ est calculé par sommation raie-par-raie :
$$k_\nu = \sum_i S_i(T) \cdot f(\nu - \nu_{0,i}) \cdot n_{\text{CO}_2}$$
où $n_{\text{CO}_2}$ est la densité moléculaire en molécules/cm³ calculée via la loi des gaz parfaits :
$$n = \frac{P}{k_B T} \cdot \left(\text{ppm} \times 10^{-6}\right)$$

## 2. Profils de Raie
- **Doppler (élargissement thermique)** :
  $$\alpha_D = \frac{\nu_0}{c} \sqrt{\frac{2 k_B T \ln 2}{M_{\text{mol}}}}$$
  $$f_D(\Delta \nu) = \sqrt{\frac{\ln 2}{\pi}} \frac{1}{\alpha_D} \exp\left( - \ln 2 \left( \frac{\Delta \nu}{\alpha_D} \right)^2 \right)$$

- **Lorentz (élargissement collisionnel)** :
  $$\alpha_L(p, T) = \left( \frac{T_0}{T} \right)^n \left[ \gamma_{\text{air}} (p - p_{\text{self}}) + \gamma_{\text{self}} p_{\text{self}} \right]$$
  $$f_L(\Delta \nu) = \frac{1}{\pi} \frac{\alpha_L}{(\Delta \nu - \delta_{\text{air}} p)^2 + \alpha_L^2}$$

- **Voigt** :
  Convolution Doppler-Lorentz calculée via l'approximation de Thompson-Cox-Hastings avec pondération $\eta$.

## 3. Fraction Molaire de Colonne Sèche $X_{\text{CO}_2}$
$$X_{\text{CO}_2} = \frac{\int_0^{P_s} q_{\text{CO}_2}(p) \, dp}{\int_0^{P_s} (1 - q_{\text{H}_2\text{O}}(p)) \, dp}$$
Mesurée par le rapport entre la colonne de $\text{CO}_2$ et la colonne de $\text{O}_2$ (issu de la bande $\text{O}_2$-A à 0.76 µm).

## 4. Métriques Statistiques de Validation
- Biais : $\text{Biais} = \frac{1}{N} \sum_{i=1}^N (M_i - O_i)$
- MAE : $\text{MAE} = \frac{1}{N} \sum_{i=1}^N |M_i - O_i|$
- RMSE : $\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (M_i - O_i)^2}$
- Corrélation de Pearson : $r = \frac{\sum (O_i - \bar{O})(M_i - \bar{M})}{\sqrt{\sum (O_i - \bar{O})^2 \sum (M_i - \bar{M})^2}}$
