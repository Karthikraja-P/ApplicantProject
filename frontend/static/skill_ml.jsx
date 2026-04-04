const { useState, useEffect, useRef } = React;

const QUESTIONS = [
  { id:1, cat:"ML Foundations",
    q:"You train and evaluate a model on the same dataset. The Sharpe looks extraordinary. What is the fundamental problem?",
    opts:[
      "Sharpe requires 252+ trading days — shorter samples make it statistically unreliable",
      "In-sample evaluation cannot detect overfitting — the model memorised the data rather than learning generalisable patterns",
      "The model must be retrained monthly — a single training run decays as markets change",
      "Sharpe is not an ML metric — use accuracy or F1 instead",
    ], ans:1 },

  { id:2, cat:"ML Foundations",
    q:"Training loss decreases over 200 epochs. Validation loss stops improving after epoch 40 and starts rising. What is the correct action?",
    opts:[
      "Train to epoch 200 — early validation fluctuations are noise; the final weights are most informed",
      "Increase the learning rate — the rising validation loss indicates the optimiser is stuck in a local minimum",
      "Stop at the epoch with the lowest validation loss — continuing only deepens overfitting",
      "Switch to a simpler model — rising validation loss always means the architecture is too large",
    ], ans:2 },

  { id:3, cat:"ML Foundations",
    q:"You split time-series trade data using standard k-fold, randomly shuffling rows first. What is the critical flaw?",
    opts:[
      "K-fold doesn't stratify by class — imbalanced trade outcomes will be unevenly distributed across folds",
      "Random shuffling destroys temporal order — training folds inadvertently contain future observations, inflating all performance estimates",
      "K-fold underestimates variance because each fold sees the full feature distribution",
      "K-fold assumes Gaussian labels — financial returns are fat-tailed, making fold statistics unreliable",
    ], ans:1 },

  { id:4, cat:"ML Foundations",
    q:"You run 50 feature-selection tests at p < 0.05. Eight features pass. You report them as significant. What is the flaw?",
    opts:[
      "p < 0.05 is too conservative for financial data — the industry standard is 0.10",
      "Sequential testing creates correlated subsets — the 8 features share information that should be penalised jointly",
      "50 tests at p < 0.05 expects ~2.5 false discoveries by chance — without multiple-testing correction, spurious features likely passed",
      "Significance confirms information content, not out-of-sample usefulness — the wrong criterion entirely",
    ], ans:2 },

  { id:5, cat:"ML Foundations",
    q:"You apply L1 regularisation to a linear return-prediction model. What is the key practical difference from L2?",
    opts:[
      "L1 penalises large weights more aggressively, making the model conservative near extreme returns",
      "L2 penalises the learning rate directly; L1 penalises weight magnitudes — they are effectively equivalent in practice",
      "L1 drives irrelevant weights exactly to zero, acting as embedded feature selection — L2 only shrinks weights",
      "L1 is only appropriate for classifiers — for continuous return regression, L2 is always preferred",
    ], ans:2 },

  { id:6, cat:"ML Foundations",
    q:"SHAP values explain a GBT model. For one specific trade, RSI_14 has a large positive SHAP value. What does this mean precisely?",
    opts:[
      "RSI_14 has the largest positive weight in the model's weight vector for this prediction",
      "For this observation, RSI_14 pushed the prediction higher relative to the baseline — a local explanation for this trade only",
      "RSI_14 is globally positively correlated with the target across all training data",
      "Removing RSI_14 would reduce model accuracy by approximately that SHAP magnitude",
    ], ans:1 },

  { id:7, cat:"ML Foundations",
    q:"Predicting intraday NIFTY returns from tabular features (RSI, volume ratios, bid-ask spread). GBT or LSTM — which is generally more robust?",
    opts:[
      "LSTM — it captures autocorrelation that a row-independent GBT cannot from static point-in-time features",
      "GBT — it handles missing values natively, critical for financial data with gaps from trading halts",
      "GBT — engineered tabular features already capture temporal structure; LSTM rarely outperforms GBT on structured financial data",
      "LSTM — raw price sequences can be fed directly, avoiding lookahead risk from manual feature construction",
    ], ans:2 },

  { id:8, cat:"ML Foundations",
    q:"You run 200 backtests varying hyperparameters and report the best result. Why is this problematic even if each individual backtest is clean?",
    opts:[
      "More than 100 backtests on the same dataset compounds the type I error rate beyond recovery",
      "Different hyperparameters define different model classes — cross-class comparison requires a different statistical framework",
      "Varying hyperparameters while holding data constant introduces lookahead — the chosen config depends on test outcomes",
      "Reporting the best of 200 results is implicit multiple testing — that Sharpe is the maximum of a distribution, making it systematically overoptimistic",
    ], ans:3 },

  { id:9, cat:"ML Foundations",
    q:"GBT on NIFTY options data: training loss = 0.02, validation loss = 0.19. What does this indicate and what is the fix?",
    opts:[
      "Underfitting — validation far exceeding training means insufficient capacity; increase depth and estimators",
      "Validation set is too small — below 500 samples, validation loss estimates are too noisy to interpret",
      "Overfitting — the large gap means the model memorised training data; reduce complexity via shallower trees or stronger regularisation",
      "Misspecified loss — financial returns require an asymmetric loss, not standard MSE",
    ], ans:2 },

  { id:10, cat:"ML Foundations",
    q:"IC = 0.08 in-sample on 2018–2022 data. IC drops to 0.01 when deployed in 2023. Most likely explanation?",
    opts:[
      "4 years is too few — IC estimates below 10 years of data are statistically unreliable by construction",
      "IC = 0.08 indicates in-sample overfitting — the Fundamental Law flags IC above 0.05 as an overfitting threshold",
      "2023 entered a different regime — the feature distributions the model learned no longer hold out-of-sample",
      "IC decay is normal — all models converge to IC ≈ 0 within 12 months of deployment",
    ], ans:2 },

  { id:11, cat:"Financial ML",
    q:"A feature uses a 20-day moving average. Row 10's feature uses days 1–20, but the label date is day 15. What has gone wrong?",
    opts:[
      "Window is too short — financial MAs need at least 50 periods to filter noise reliably",
      "The MA introduces autocorrelation that violates the IID assumption of most loss functions",
      "The feature uses data from after the label date — lookahead bias means the model trains on unavailable information",
      "Computing features across label boundaries inflates feature variance and distorts gradient descent",
    ], ans:2 },

  { id:12, cat:"Financial ML",
    q:"You normalise the full dataset (mean=0, std=1) before splitting into train/test. What is the leakage?",
    opts:[
      "Normalisation changes the sign of negative returns, distorting momentum feature direction",
      "Normalisation statistics are computed using test-set observations — the model has implicitly seen the test distribution during training",
      "Standardised features cannot be used with tree models, which need raw magnitudes for split thresholds",
      "Normalisation removes the autocorrelation structure that time-series models depend on",
    ], ans:1 },

  { id:13, cat:"Financial ML",
    q:"You fit PCA on the full dataset to reduce 150 features to 10 components, then split train/test. What is the leakage?",
    opts:[
      "PCA components are orthogonal — orthogonal features cannot share covariance with the test set by definition",
      "The PCA rotation embeds test-set covariance structure — test performance is overoptimistic because the components were fit on it",
      "PCA discards low-variance directions that contain regime-shift information critical for out-of-sample robustness",
      "PCA is invalid for financial data — non-Gaussian returns violate the elliptical distribution assumption",
    ], ans:1 },

  { id:14, cat:"Financial ML",
    q:"You tune hyperparameters on a validation set, then report performance on the same validation set as your out-of-sample estimate. What is wrong?",
    opts:[
      "The estimate is upward-biased — the config was chosen to maximise performance on this exact fold; a separate test set is required",
      "Tuning and evaluation use different objectives — selecting by loss and reporting Sharpe creates a metric mismatch",
      "Reusing the validation fold is only a problem with more than 5 hyperparameters — for GBT with 3–4, the bias is negligible",
      "The validation set should be excluded from all training — but reusing it for tuning doesn't bias performance, only hyperparameter selection",
    ], ans:0 },

  { id:15, cat:"Financial ML",
    q:"Momentum backtest Sharpe = 2.1. What is the single most important check before declaring success?",
    opts:[
      "Verify at least 100 trades per year — fewer makes the Sharpe confidence interval too wide to interpret",
      "Confirm the strategy is uncorrelated with the Nifty 50 — a high-beta strategy is redundant vs passive indexing",
      "Run on randomly permuted returns to verify the Sharpe is statistically impossible under the zero-edge null",
      "Confirm every signal used only data available at that moment — no retrospectively-adjusted prices or delayed publications used as real-time",
    ], ans:3 },

  { id:16, cat:"Financial ML",
    q:"You predict 5-day forward returns from daily rows. Adjacent rows share 4 label days. What is the problem?",
    opts:[
      "Adjacent rows share features from overlapping lookback windows — decorrelate with PCA before training",
      "Overlapping labels create serial correlation in the target — use non-overlapping labels or weight samples inversely to label overlap",
      "Label overlap inflates sample count 5×, causing the model to be under-regularised relative to the true sample size",
      "Overlapping returns violate the martingale property — use log-returns to restore the IID assumption",
    ], ans:1 },

  { id:17, cat:"Financial ML",
    q:"Your historical dataset contains only current NIFTY 50 constituents. What bias does training on this introduce?",
    opts:[
      "The model learns a large-cap tilt — current constituents skew high market-cap, disguising a size factor as an ML signal",
      "Current constituents have unusually stable features — the model underestimates deployment-period signal noise",
      "Removed constituents were mostly poor performers — the model trains on a positive-return biased sample, inflating backtest Sharpe",
      "Restricting to index members creates a sector concentration bias — the model learns sector effects, not instrument alpha",
    ], ans:2 },

  { id:18, cat:"Financial ML",
    q:"Walk-forward validation, 252-day train, 21-day test. What does 'purging' refer to?",
    opts:[
      "Removing instruments with corporate actions during the training window",
      "Discarding low-volume days from both windows to reduce noise near the boundary",
      "Excluding boundary observations whose label construction overlaps with the test window — preventing lookahead through the target variable",
      "Zeroing feature values in the final 5 training days to stabilise the feature distribution",
    ], ans:2 },

  { id:19, cat:"Financial ML",
    q:"You download quarterly EPS data today and backtest from 2015–2023. What is the critical data integrity problem?",
    opts:[
      "EPS must be adjusted for splits and dividends — unadjusted values misalign with price-based return calculations",
      "Earnings are released 30–45 days after quarter end — using the calendar quarter date introduces a systematic 30–45 day lookahead",
      "Databases correct EPS when companies restate — today's corrections weren't available at the original report date",
      "Today's download reflects retrospective revisions and restatements — the model trains on information no investor had at those historical dates",
    ], ans:3 },

  { id:20, cat:"Financial ML",
    q:"Raw daily closing prices are your input features for a return-prediction model. What is the core problem?",
    opts:[
      "Prices have too many decimal places — floating-point precision causes instability during gradient descent",
      "Prices are non-stationary — the feature distribution at inference will differ from training, causing systematic errors the model was never exposed to",
      "Prices are correlated across instruments — multicollinearity inflates feature importance estimates",
      "Tree models use fixed split thresholds — a rising price series pushes observations outside the trained split range",
    ], ans:1 },

  { id:21, cat:"Financial ML",
    q:"Classifier on 5-min NIFTY candles: 80% up, 20% down. Model gets 82% accuracy by always predicting 'up'. What should you do?",
    opts:[
      "Collect more data until the minority class exceeds 30% — accuracy becomes reliable below 70/30 imbalance",
      "Replace accuracy with F1 or precision-recall AUC — these penalise ignoring the minority class, unlike accuracy",
      "Add a softmax output layer — this calibrates class probabilities to reflect the true imbalance",
      "Switch to regression on return magnitude — continuous prediction sidesteps class imbalance entirely",
    ], ans:1 },

  { id:22, cat:"ML Foundations",
    q:"You want XGBoost to output calibrated probabilities — P(return > 0) = 0.7 should occur 70% of the time. Correct approach?",
    opts:[
      "Divide raw scores by the maximum score to compress them into [0,1]",
      "Apply Platt scaling or isotonic regression on a held-out calibration set — maps scores to proper probabilities without distorting rank order",
      "Apply sigmoid to raw scores — XGBoost uses logistic loss internally, so its output is already calibrated",
      "Calibration is only needed for exact probability applications — for trade ranking, raw scores are always sufficient",
    ], ans:1 },

  { id:23, cat:"Financial ML",
    q:"Your model's buy-signal class has precision = 0.85 and recall = 0.30. What does this tell you?",
    opts:[
      "The model is well-calibrated — high precision and recall above 0.25 is acceptable for financial classifiers",
      "When it fires, it is right 85% of the time — but it misses 70% of actual opportunities, capturing very little available alpha",
      "High precision with low recall is a known overfitting signature — the model memorised training labels",
      "Recall of 0.30 means 30% accuracy — barely better than random and should be discarded",
    ], ans:1 },

  { id:24, cat:"ML Foundations",
    q:"Model A has higher mean return; Model B has higher Sharpe. When would you prefer Model B?",
    opts:[
      "Never — higher mean return is the only metric that matters; volatility is managed separately through position sizing",
      "When capital preservation matters, leverage is limited, or drawdowns would breach risk limits — Sharpe captures whether return justifies the risk taken",
      "Only if both models have the same trade frequency — comparing Sharpe across different frequencies is misleading",
      "Model A for intraday, Model B for multi-day — this is the conventional mapping by holding period",
    ], ans:1 },

  { id:25, cat:"Financial ML",
    q:"Live Sharpe = 1.8 in months 1–6, then −0.3 in months 7–9. What should you investigate first?",
    opts:[
      "Quarterly hyperparameter retuning is overdue — this magnitude of decay typically signals the learning rate needs recalibration",
      "A regime change has occurred — market structure shifted and the model's features are no longer predictive; diagnose before retraining",
      "The 6-month Sharpe window is too short to distinguish decay from noise — extend to 3 years before acting",
      "Rolling Sharpe is downward-biased during high-vol periods — the denominator inflated, making the decline a measurement artefact",
    ], ans:1 },

  { id:26, cat:"Financial ML",
    q:"'Time_of_day' is your model's single most important feature. What should you investigate first?",
    opts:[
      "Tree models can't handle cyclic variables without sin/cos encoding — raw integers imply a false ordinal relationship that inflates importance",
      "It may proxy for structural patterns like open-auction liquidity or close rebalancing — determine if it is a genuine alpha source or a training artefact",
      "Time-of-day violates covariance stationarity — including it conditions the signal on intraday microstructure that changes across years",
      "High importance here is a known overfitting signal — remove it and check if validation Sharpe improves",
    ], ans:1 },

  { id:27, cat:"Financial ML",
    q:"200 candidate features, many correlated at r > 0.9. What is the primary risk of passing all into a linear model?",
    opts:[
      "Highly correlated features make the loss surface non-convex — the optimiser cycles without converging",
      "Multicollinearity makes coefficients unstable — correlated features can carry large opposing weights that cancel, hiding true predictive structure",
      "L2 regularisation automatically zeroes correlated features — the problem only arises without any regularisation",
      "Correlation inflates effective model capacity beyond the nominal hyperparameters, leaving the model under-regularised",
    ], ans:1 },

  { id:28, cat:"ML Foundations",
    q:"A continuous feature 'volume' ranks first in random forest MDI importance. A colleague says the score is inflated. Why might they be right?",
    opts:[
      "MDI scores continuous variables by their mean decrease in impurity across all possible splits — high-cardinality features get more split opportunities, inflating their apparent importance",
      "Volume correlates with price — correlated features always split their importance scores, so volume's display value understates its true standalone contribution",
      "MDI favours features used in early layers — volume appears near the root by coincidence of training order, not genuine importance",
      "MDI ranks by frequency of use across trees, not actual effect size — frequent use of a low-impact feature inflates its score",
    ], ans:0 },

  { id:29, cat:"ML Foundations",
    q:"Which approach correctly evaluates a model when you cannot afford a separate hold-out test set for a financial time-series?",
    opts:[
      "Train on all data and report training loss — with a large enough dataset, training loss approximates test loss",
      "Walk-forward cross-validation: train on expanding or rolling windows, test on sequential future blocks — temporal order is preserved and each test fold is genuinely out-of-sample",
      "Standard k-fold with stratification by market regime — stratification corrects for the temporal ordering problem in standard k-fold",
      "Use bootstrapping — randomly resample with replacement to create pseudo-test sets that approximate the true out-of-sample distribution",
    ], ans:1 },

  { id:30, cat:"ML Foundations",
    q:"You build a return-prediction model with 150 features. After training, only 10 features have non-zero weights. What regularisation was applied?",
    opts:[
      "L2 — it shrinks all weights proportionally toward zero, retaining only the strongest predictors",
      "Dropout — randomly zeroing neurons during training produces sparse weight vectors at convergence",
      "L1 — it drives irrelevant weights exactly to zero, producing a sparse model with automatic feature selection",
      "Early stopping — halting before convergence prevents small features from accumulating weight over time",
    ], ans:2 },

  { id:31, cat:"Financial ML",
    q:"A model trained on 2019–2022 data (bull, crash, recovery) faces a low-volatility sideways 2023 market. What distribution shift is this?",
    opts:[
      "Label shift — the proportion of profitable trades changed, so class priors are miscalibrated",
      "Concept drift — features are stationary but the relationship between features and returns reversed",
      "Covariate shift — the input feature distribution in deployment differs from training, so the model operates outside its calibrated region",
      "Overfitting — the model memorised regime-specific patterns rather than structural relationships",
    ], ans:2 },

  { id:32, cat:"ML Foundations",
    q:"A 500-tree random forest has no validation set. How does Out-of-Bag (OOB) error provide a reliable generalisation estimate?",
    opts:[
      "OOB evaluates each tree on training samples it didn't split on — these are still training samples, so OOB measures memorisation, not generalisation",
      "OOB averages error across all trees — averaging reduces variance, but introduces downward bias from the ensemble's smoothing effect",
      "Each bootstrap sample omits ~37% of observations — those unseen samples are aggregated into an OOB estimate equivalent to a hold-out, since each sample is only evaluated by trees that never saw it",
      "OOB uses only trees with low training loss — it is a pruning-adjusted training error, not a true generalisation estimate",
    ], ans:2 },

  { id:33, cat:"Financial ML",
    q:"A stock-return model applied to NIFTY 50 options degrades sharply despite similar feature distributions. Most likely cause?",
    opts:[
      "Options P&L is a non-linear function of direction, magnitude, moneyness, and time-to-expiry — a directional stock model captures none of this",
      "Feature normalisation was calibrated to equity magnitudes — options premiums fall outside those bounds, collapsing model predictions",
      "Stock models use daily bars; options require intraday granularity to capture theta decay near expiry",
      "The stock model ranks a cross-section — applied to a single option time series, the ranking objective is no longer valid",
    ], ans:0 },

  { id:34, cat:"Financial ML",
    q:"Your top feature IV_rank has shifted from a training-period mean of 45 to a live mean of 72. Correct operational response?",
    opts:[
      "Retrain immediately — a mean shift of this magnitude always means the model is outside its calibrated input range",
      "Recalibrate normalisation bounds, then assess whether prediction quality has actually degraded before retraining — a mean shift alone doesn't confirm model deterioration",
      "Remove IV_rank permanently — drifting features proxy regime changes and are unreliable across regimes",
      "Increase position size — higher IV means wider expected moves, improving the risk-reward of long-options positions",
    ], ans:1 },

  { id:35, cat:"ML Foundations",
    q:"GBT with max_depth=8, learning_rate=0.1 is overfitting. How do reducing max_depth and reducing learning_rate control overfitting through different mechanisms?",
    opts:[
      "Max depth controls tree count — reducing it limits total ensemble capacity; learning rate controls convergence speed and doesn't affect overfitting",
      "Both limit total ensemble weight — reducing either proportionally produces an equivalent regularisation effect",
      "Max depth limits feature interactions per tree — shallower trees capture fewer terms; a lower learning rate requires more trees for the same fit, making early stopping more precise",
      "Reducing max_depth to 1 eliminates overfitting entirely for datasets under 10,000 samples — learning rate only helps when depth is already minimal",
    ], ans:2 },

  { id:36, cat:"Financial ML",
    q:"Transaction costs: 3 bps per trade. Model generates 8 trades/day on ₹1 crore. What does this imply for viability?",
    opts:[
      "3 bps is below the materiality threshold — costs only matter when they exceed the instrument's average daily bid-ask spread",
      "Costs are symmetric — they reduce wins and losses equally, netting to zero Sharpe impact; only gross return matters",
      "8 × 3 bps × 250 days = 6,000 bps annual drag — the strategy needs an exceptionally high gross Sharpe to survive; reduce frequency first",
      "High-frequency strategies always benefit from compounding — the 6,000 bps drag is offset by the higher information ratio from frequent rebalancing",
    ], ans:2 },

  { id:37, cat:"Financial ML",
    q:"Strong buy signals on near-expiry CE options. Live fills are 15–20% worse than backtest prices. What assumption is failing?",
    opts:[
      "The backtest used mid-price — live buys fill at the ask, producing the 15–20% slippage, within normal bid-ask expectations",
      "Near-expiry options have very low delta — predicted underlying moves don't translate proportionally into option P&L at deep time decay",
      "Near-expiry options are illiquid with wide spreads — the backtest assumed last-traded price fills not achievable on thin order books",
      "Theta decay accelerates near expiry — the backtest didn't model holding costs, reducing realised P&L vs mark-to-market",
    ], ans:2 },

  { id:38, cat:"ML Foundations",
    q:"Online learning (update per observation) vs weekly batch retraining. When is online learning preferable for a trading model?",
    opts:[
      "Always — smaller, more frequent updates are universally more sample-efficient regardless of stationarity",
      "When regime is shifting rapidly and delayed updates are causing measurable live performance decay — update instability costs less than staleness",
      "When the process is stable and stationary — online learning converges faster under stationarity",
      "When the feature set changes frequently — batch retraining restarts the full pipeline each time a feature is added",
    ], ans:1 },

  { id:39, cat:"Financial ML",
    q:"RSI feature distribution has shifted significantly. Separately, out-of-sample IC dropped from 0.07 to 0.01. How should you interpret this together?",
    opts:[
      "Feature drift always causes concept drift — the IC drop is a direct consequence of the RSI shift; retrain immediately",
      "Feature drift is a change in input distribution; IC drop is degraded predictive performance — they may be related or independent; each requires separate investigation before acting",
      "IC drop is primary; RSI shift is a consequence — when return structure changes, RSI shifts as a lagging indicator; fix concept drift and the feature drift resolves",
      "Both signals measure the same phenomenon at different model layers — monitoring both is redundant; track only IC",
    ], ans:1 },

  { id:40, cat:"Financial ML",
    q:"Model generates buy signals for high-beta stocks before rallies. Excellent Sharpe, but attribution shows return = market beta, not alpha. Fix?",
    opts:[
      "Remove high-beta stocks from the universe — restricting to beta < 0.5 ensures zero systematic exposure by construction",
      "Regress predicted returns against the market return and subtract the fitted component — isolates the model's contribution from beta-driven returns",
      "Retrain using only sector-relative features — sector-relative signals cancel across the cross-section, implicitly hedging beta",
      "Reduce position size when signals are correlated across many stocks — correlation indicates response to a common factor",
    ], ans:1 },

  { id:41, cat:"ML Foundations",
    q:"Model A: lower training loss, higher validation loss. Model B: trains slower, generalises better. What principle explains B?",
    opts:[
      "Model B is underfitting — a model that trains slowly isn't learning training data well, so it ignores noise and generalises better",
      "Model B converged to a flatter loss surface minimum — flat minima generalise better because small weight perturbations produce smaller loss changes",
      "Model B has more parameters — larger models always generalise better as they can represent the true distribution more accurately",
      "Model B has more regularisation — any regularisation always reduces validation loss compared to no regularisation",
    ], ans:1 },

  { id:42, cat:"ML Foundations",
    q:"Five independently-trained models each have Sharpe 0.8. The ensemble has Sharpe ≈ 1.8. What statistical principle explains this?",
    opts:[
      "Ensembling averages training loss — overfitting models are down-weighted, leaving only the signal component",
      "Ensembling reduces max drawdown — the portfolio of signals diversifies away the worst model's contribution at any time",
      "If individual model errors are uncorrelated, the average's variance is 1/n of each model's — five uncorrelated models reduce prediction noise without needing better individual models",
      "Each model trained on different features — the ensemble spans the full feature space, improving coverage vs any single model",
    ], ans:2 },

  { id:43, cat:"ML Foundations",
    q:"1,000-tree GBT stops at tree 340 when validation loss rises. Why is early stopping an effective regulariser?",
    opts:[
      "It implements implicit L2 — shrinking gradients at each step is equivalent to weight decay, reducing the effective L2 coefficient",
      "Each tree fits residuals of all prior trees — stopping when validation rises prevents fitting residuals that are pure training noise, capping capacity without changing architecture",
      "It identifies the underfitting-to-overfitting transition — it restores the model to the last underfitting state, which has zero generalisation gap",
      "It removes trees with negative marginal validation contribution — pruning these from the ensemble leaves only trees that improve generalisation",
    ], ans:1 },

  { id:44, cat:"ML Foundations",
    q:"Two models, 95% negative / 5% positive class. Both report 95% accuracy. What additional evaluation is necessary?",
    opts:[
      "Increase dataset size — accuracy is only unreliable below 1,000 samples; with sufficient data, accuracy differentiates models reliably",
      "Evaluate precision, recall, and F1 on the minority class — a model predicting all-negative achieves 95% accuracy trivially without learning anything",
      "Retrain with class weights — imbalanced data requires weighted training before any metric comparison is valid",
      "Switch to log-loss — it is immune to class imbalance by construction and is always the correct replacement for accuracy on skewed datasets",
    ], ans:1 },

  { id:45, cat:"Financial ML",
    q:"A satellite imagery (foot traffic) feature has IC = 0.12 in year one, dropping to 0.02 by year three. Most likely explanation?",
    opts:[
      "Higher-resolution imagery in year three has different statistical properties — covariate shift degrades model performance",
      "Competing funds discovered and traded on the signal — arbitrage activity eroded the price inefficiency, reducing IC toward zero",
      "The underlying relationship weakened as e-commerce grew — foot traffic became less predictive as online sales offset in-store declines",
      "Three years of live trading introduced survivorship bias — stocks with declining foot traffic that performed well were retroactively added to training",
    ], ans:1 },

  { id:46, cat:"ML Foundations",
    q:"Expanding training window (all history up to T) vs fixed rolling window (last N months). What is the core tradeoff?",
    opts:[
      "Expanding windows guarantee distributional stationarity — rolling windows lose early-regime information that stabilises the feature-return mapping",
      "Expanding windows dilute regime-sensitivity by equally weighting distant history — rolling windows adapt faster but discard valid long-term structural patterns",
      "Rolling windows create leakage — the validation start falls within the training window because the window slides less than its length",
      "Expanding windows always produce higher out-of-sample Sharpe — rolling windows are only for strategies that retrain daily",
    ], ans:1 },

  { id:47, cat:"Financial ML",
    q:"Two uncorrelated signals, identical expected returns. Signal A: low return volatility. Signal B: high return volatility. Mean-variance weighting?",
    opts:[
      "Equal weights — identical expected returns mean mean-variance assigns equal capital regardless of volatility differences",
      "Signal A gets higher weight — mean-variance weights proportional to return / variance; lower volatility directly yields higher optimal allocation",
      "Signal B gets higher weight — higher volatility widens the return distribution, increasing the probability of large positive outcomes",
      "Weights depend on each signal's market beta — mean-variance cannot determine relative weights without knowing systematic exposure",
    ], ans:1 },

  { id:48, cat:"Financial ML",
    q:"Signal A: IC = 0.06 over 1 year. Signal B: IC = 0.04 over 5 years. Which do you trust more for deployment?",
    opts:[
      "Signal A — higher IC always indicates a stronger predictive relationship regardless of sample size",
      "Signal B — lower IC over a longer, more diverse period is a more reliable estimate of true predictive power; sample size and regime diversity matter as much as IC magnitude",
      "Neither — IC below 0.1 is statistically insignificant for financial models regardless of sample size",
      "Signal A — recent data is more relevant; a strong IC over the last year is more likely to persist than one calibrated over a distant 5-year window",
    ], ans:1 },

  { id:49, cat:"ML Foundations",
    q:"Random forest MDI ranks 'volume_ratio' first. A permutation importance test ranks it much lower. What does this suggest?",
    opts:[
      "Permutation importance is unreliable on financial data — random shuffling is sensitive to the random seed and produces unstable rankings",
      "MDI inflates high-cardinality continuous features because more split points give more opportunities to appear important — permutation importance better reflects true predictive contribution by directly measuring the effect of losing the feature",
      "The discrepancy means the model is overfitting to volume_ratio — both metrics must agree before a feature can be retained in production",
      "MDI and permutation importance measure different things by design and should never be expected to agree — reporting both is standard practice",
    ], ans:1 },

  { id:50, cat:"Financial ML",
    q:"Position sizing: size = signal × (target_vol / realized_vol). Why does dividing by realized_vol improve risk management?",
    opts:[
      "It converts the signal into a vol-adjusted probability — ensuring the output is properly calibrated across volatility regimes",
      "It normalises position sizes so expected P&L volatility is consistent across regimes — smaller in turbulent markets, larger in calm ones, targeting constant risk not constant notional",
      "It prevents overweighting high-vol instruments that would dominate portfolio returns through higher absolute return magnitude",
      "It Sharpe-ratio-weights each position — ensuring equal contribution to the portfolio's information ratio from each independent signal",
    ], ans:1 },
];

const CAT_META = {
  "ML Foundations": { weight:"46%", count:23, accent:"#378ADD", light:"#E6F1FB", dark:"#0C447C" },
  "Financial ML":   { weight:"54%", count:27, accent:"#7F77DD", light:"#EEEDFE", dark:"#3C3489" },
};

const TOTAL_SECONDS = 600;
const fmt = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

const Badge = ({ cat }) => {
  const m = CAT_META[cat];
  return (
    <span style={{ fontSize:12, fontWeight:500, padding:"3px 10px", borderRadius:6,
      display:"inline-block", background:m.light, color:m.dark }}>{cat}</span>
  );
};

function Welcome({ onStart }) {
  return (
    <div style={{ padding:"1.5rem 0", maxWidth:580, margin:"0 auto" }}>
      <p style={{ fontSize:13, fontFamily:"monospace", color:"#888", margin:"0 0 6px", letterSpacing:"0.04em" }}>
        PHASE 1 · ENGINEER SCREENING
      </p>
      <h2 style={{ fontSize:24, fontWeight:600, margin:"0 0 6px", letterSpacing:"-0.02em" }}>
        Financial ML skill test
      </h2>
      <p style={{ color:"#888", fontSize:15, margin:"0 0 2rem" }}>
        50 questions · 10-minute countdown · you may skip any question
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:"1.5rem" }}>
        {Object.entries(CAT_META).map(([k,m]) => (
          <div key={k} style={{ background:"#f8f8f7", borderRadius:10, padding:"14px 16px", border:"1px solid #e8e8e6" }}>
            <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4,
              background:m.light, color:m.dark, letterSpacing:"0.02em" }}>{m.weight}</span>
            <p style={{ fontSize:14, fontWeight:500, margin:"6px 0 2px", color:"#1a1a1a" }}>{k}</p>
            <p style={{ fontSize:12, color:"#888", margin:0 }}>{m.count} questions</p>
          </div>
        ))}
      </div>
      <div style={{ background:"#f8f8f7", borderRadius:10, padding:"12px 16px",
        border:"1px solid #e8e8e6", marginBottom:"1.5rem", fontSize:12, color:"#777", lineHeight:1.7 }}>
        Overfitting · lookahead bias · data leakage · non-stationarity · cross-validation ·
        feature selection · class imbalance · regularisation · regime change ·
        transaction cost modelling · model explainability · survivorship bias ·
        signal decay · ensembling · production drift
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8,
        background:"#f8f8f7", borderRadius:10, padding:"14px 16px",
        border:"1px solid #e8e8e6", marginBottom:"1.5rem" }}>
        {[["≥ 80%","Strong pass","#e1f5ee","#085041"],["60–79%","Borderline","#faeeda","#633806"],["< 60%","Does not meet bar","#fcebeb","#a32d2d"]].map(([pct,label,bg,fg]) => (
          <div key={pct} style={{ textAlign:"center" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a" }}>{pct}</div>
            <div style={{ fontSize:11, marginTop:3, padding:"2px 6px", borderRadius:4,
              background:bg, color:fg, display:"inline-block" }}>{label}</div>
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{ width:"100%", padding:14, background:"#1a1a1a", color:"#fff",
        border:"none", borderRadius:8, fontSize:15, fontWeight:500, cursor:"pointer", letterSpacing:"0.01em" }}>
        Begin test → 10:00
      </button>
    </div>
  );
}

function Quiz({ onDone }) {
  const [cur, setCur]         = useState(0);
  const [sel, setSel]         = useState(null);
  const [records, setRecords] = useState([]);
  const [tLeft, setTLeft]     = useState(TOTAL_SECONDS);
  const busy       = useRef(false);
  const timerRef   = useRef(null);
  const recordsRef = useRef([]);
  const qStartRef  = useRef(Date.now());

  useEffect(() => {
    qStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); onDone(recordsRef.current, 0); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [onDone]);

  const advance = (record) => {
    const next = [...recordsRef.current, record];
    recordsRef.current = next;
    setRecords(next);
    setTimeout(() => {
      setSel(null);
      busy.current = false;
      if (cur + 1 >= QUESTIONS.length) { clearInterval(timerRef.current); onDone(next, tLeft); }
      else { setCur(c => c + 1); qStartRef.current = Date.now(); }
    }, record.type === "skipped" ? 0 : 680);
  };

  const pick = (idx) => {
    if (busy.current || sel !== null) return;
    busy.current = true;
    setSel(idx);
    const timeSpent = (Date.now() - qStartRef.current) / 1000;
    advance({ type:"answered", correct: idx === QUESTIONS[cur].ans, sel: idx, correctIdx: QUESTIONS[cur].ans, timeSpent });
  };

  const skip = () => {
    if (busy.current || sel !== null) return;
    busy.current = true;
    advance({ type:"skipped", correctIdx: QUESTIONS[cur].ans, timeSpent: (Date.now() - qStartRef.current) / 1000 });
  };

  const q        = QUESTIONS[cur];
  const answered = records.filter(r => r.type === "answered");
  const skipped  = records.filter(r => r.type === "skipped");
  const isRed    = tLeft <= 60;
  const isAmb    = tLeft <= 180 && !isRed;
  const catColor = CAT_META[q.cat].accent;

  return (
    <div style={{ padding:"1.5rem 0", maxWidth:580, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
        <Badge cat={q.cat} />
        <span style={{ fontFamily:"monospace", fontSize:22, fontWeight:700, letterSpacing:"0.04em",
          color: isRed ? "#e24b4a" : isAmb ? "#ba7517" : "#1a1a1a" }}>{fmt(tLeft)}</span>
      </div>
      <div style={{ marginBottom:"1.25rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#aaa", marginBottom:6 }}>
          <span>Q{cur+1} / {QUESTIONS.length}</span>
          <span style={{ display:"flex", gap:12 }}>
            <span>{answered.filter(r=>r.correct).length} correct</span>
            {skipped.length > 0 && <span style={{ color:"#ba7517" }}>{skipped.length} skipped</span>}
          </span>
        </div>
        <div style={{ height:3, background:"#ebebeb", borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(cur/QUESTIONS.length)*100}%`,
            background:catColor, borderRadius:2, transition:"width 0.35s ease" }} />
        </div>
      </div>
      <div style={{ background:"#f8f8f7", borderRadius:10, padding:"1rem 1.25rem",
        marginBottom:"1rem", border:"1px solid #e8e8e6", borderLeft:`3px solid ${catColor}` }}>
        <p style={{ fontSize:15.5, fontWeight:500, margin:0, lineHeight:1.6, color:"#1a1a1a" }}>{q.q}</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {q.opts.map((opt, i) => {
          let bg = "#fff", border = "1px solid #e0e0e0", color = "#1a1a1a";
          if (sel !== null) {
            if (i === q.ans)                     { bg = "#e1f5ee"; border = "1px solid #1D9E75"; color = "#085041"; }
            else if (i === sel && sel !== q.ans) { bg = "#fcebeb"; border = "1px solid #e24b4a"; color = "#a32d2d"; }
          }
          return (
            <button key={i} onClick={() => pick(i)} disabled={sel !== null}
              style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 14px",
                background:bg, border, borderRadius:8, cursor: sel!==null?"default":"pointer",
                textAlign:"left", width:"100%", transition:"all 0.18s", color, fontFamily:"inherit" }}>
              <span style={{ width:24, height:24, borderRadius:"50%", display:"flex", flexShrink:0,
                alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, marginTop:1,
                border:"1px solid currentColor", opacity:0.5 }}>
                {String.fromCharCode(65+i)}
              </span>
              <span style={{ fontSize:14, lineHeight:1.55 }}>{opt}</span>
            </button>
          );
        })}
      </div>
      <button onClick={skip} disabled={sel !== null}
        style={{ marginTop:12, width:"100%", padding:"8px 14px", background:"transparent",
          border:"1px dashed #ccc", borderRadius:8, fontSize:13, color:"#aaa",
          cursor: sel!==null?"default":"pointer", fontFamily:"inherit" }}>
        Skip →
      </button>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background:"#f8f8f7", border:"1px solid #e8e8e6", borderRadius:10, padding:"14px 16px" }}>
      <div style={{ fontSize:11, color:"#aaa", marginBottom:4, letterSpacing:"0.02em" }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, fontFamily:"monospace", color:"#1a1a1a", letterSpacing:"-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#aaa", marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function Result({ records, tLeft, onRetake }) {
  const total      = QUESTIONS.length;
  const answered   = records.filter(r => r.type === "answered");
  const skipped    = records.filter(r => r.type === "skipped");
  const notReached = total - records.length;
  const correct    = answered.filter(r => r.correct).length;
  const pct        = answered.length > 0 ? Math.round((correct / answered.length) * 100) : 0;
  const avgTime    = answered.length > 0
    ? (answered.reduce((s,r) => s + r.timeSpent, 0) / answered.length).toFixed(1) : null;

  const verdict = pct >= 80
    ? { t:"Strong pass",       bg:"#e1f5ee", fg:"#085041" }
    : pct >= 60
    ? { t:"Borderline",        bg:"#faeeda", fg:"#633806" }
    : { t:"Does not meet bar", bg:"#fcebeb", fg:"#a32d2d" };

  const cats = Object.entries(CAT_META).map(([k, m]) => {
    const indices     = QUESTIONS.map((q,i) => q.cat===k ? i : -1).filter(i => i>=0);
    const catAnswered = indices.filter(i => records[i] && records[i].type==="answered");
    const got         = catAnswered.filter(i => records[i].correct).length;
    const skp         = indices.filter(i => records[i] && records[i].type==="skipped").length;
    return { k, got, ans:catAnswered.length, skp, tot:m.count, accent:m.accent };
  });

  return (
    <div style={{ padding:"1.5rem 0", maxWidth:580, margin:"0 auto" }}>
      <p style={{ fontSize:13, fontFamily:"monospace", color:"#aaa", margin:"0 0 8px", letterSpacing:"0.04em" }}>
        ASSESSMENT COMPLETE
      </p>
      <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:"1.5rem" }}>
        <span style={{ fontSize:38, fontWeight:700, fontFamily:"monospace", letterSpacing:"-0.02em", color:"#1a1a1a" }}>
          {correct}/{answered.length}
        </span>
        <span style={{ fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:6,
          background:verdict.bg, color:verdict.fg }}>{verdict.t}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:"1.5rem" }}>
        <StatCard label="QUESTIONS ANSWERED"  value={answered.length}              sub={`of ${total} total`} />
        <StatCard label="CORRECT ANSWERS"     value={correct}                      sub={`${pct}% of answered`} />
        <StatCard label="QUESTIONS SKIPPED"   value={skipped.length + notReached}  sub={notReached > 0 ? `${skipped.length} skipped · ${notReached} not reached` : "intentionally skipped"} />
        <StatCard label="AVG TIME / QUESTION" value={avgTime ? `${avgTime}s` : "—"} sub="answered questions only" />
      </div>
      <div style={{ border:"1px solid #e8e8e6", borderRadius:10, overflow:"hidden", marginBottom:"1.5rem" }}>
        {cats.map(({ k, got, ans, skp, accent }, i) => {
          const pctCat = ans > 0 ? Math.round(got/ans*100) : 0;
          return (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
              background:"#fff", borderBottom: i<cats.length-1?"1px solid #f0f0ee":"none" }}>
              <div style={{ width:9, height:9, borderRadius:"50%", flexShrink:0, background:accent }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:"#1a1a1a" }}>{k}</span>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    {skp>0 && <span style={{ fontSize:11, color:"#ba7517" }}>{skp} skipped</span>}
                    <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:600, color:"#888" }}>{got}/{ans}</span>
                  </div>
                </div>
                <div style={{ height:3, background:"#f0f0ee", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pctCat}%`, background:accent, borderRadius:2 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <details style={{ marginBottom:"1.5rem" }}>
        <summary style={{ fontSize:13, fontWeight:500, color:"#888", cursor:"pointer",
          padding:"10px 0", userSelect:"none", listStyle:"none" }}>▸ Review all answers</summary>
        <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:8 }}>
          {QUESTIONS.map((q, i) => {
            const r          = records[i];
            const wasSkipped = !r || r.type === "skipped";
            const isCorrect  = r && r.type === "answered" && r.correct;
            const bg   = wasSkipped ? "#f8f8f7" : isCorrect ? "#e1f5ee" : "#fcebeb";
            const bdr  = wasSkipped ? "#e0e0e0"  : isCorrect ? "#1D9E75"  : "#e24b4a";
            const lc   = wasSkipped ? "#aaa"      : isCorrect ? "#085041"  : "#a32d2d";
            const tag  = wasSkipped ? (r ? "skipped" : "—") : (isCorrect ? "✓" : "✗");
            return (
              <div key={q.id} style={{ background:bg, border:`1px solid ${bdr}`, borderRadius:8, padding:"10px 14px" }}>
                <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ fontSize:11, fontWeight:600, flexShrink:0, marginTop:1, color:lc }}>Q{q.id} {tag}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, margin:"0 0 4px", color:"#1a1a1a", fontWeight:500 }}>{q.q}</p>
                    <p style={{ fontSize:12, margin:0, color:lc }}>
                      {wasSkipped ? `Correct: ${q.opts[q.ans]}`
                        : isCorrect ? q.opts[q.ans]
                        : `You chose: ${q.opts[r.sel]} · Correct: ${q.opts[q.ans]}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </details>
      <button onClick={onRetake}
        style={{ width:"100%", padding:14, background:"transparent", border:"1px solid #ccc",
          borderRadius:8, fontSize:15, fontWeight:500, cursor:"pointer", color:"#1a1a1a" }}>
        Retake test
      </button>
    </div>
  );
}

function App() {
  const [phase,   setPhase]   = useState("welcome");
  const [results, setResults] = useState(null);
  const handleDone = (records, tLeft) => { setResults({ records, tLeft }); setPhase("result"); };
  if (phase === "welcome") return <Welcome onStart={() => setPhase("quiz")} />;
  if (phase === "quiz")    return <Quiz onDone={handleDone} />;
  return <Result {...results} onRetake={() => setPhase("welcome")} />;
}
