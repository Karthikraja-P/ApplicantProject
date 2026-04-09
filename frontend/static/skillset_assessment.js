// ─── Question Banks ───────────────────────────────────────────────────────────

var QUESTIONS_ML = [
  {
    id: 1, cat: "ML Foundations",
    q: "You train and evaluate a model on the same dataset. The Sharpe looks extraordinary. What is the fundamental problem?",
    opts: ["Sharpe requires 252+ trading days — shorter samples make it statistically unreliable", "In-sample evaluation cannot detect overfitting — the model memorised the data rather than learning generalisable patterns", "The model must be retrained monthly — a single training run decays as markets change", "Sharpe is not an ML metric — use accuracy or F1 instead"], ans: 1
  },
  {
    id: 2, cat: "ML Foundations",
    q: "Training loss decreases over 200 epochs. Validation loss stops improving after epoch 40 and starts rising. What is the correct action?",
    opts: ["Train to epoch 200 — early validation fluctuations are noise; the final weights are most informed", "Increase the learning rate — the rising validation loss indicates the optimiser is stuck in a local minimum", "Stop at the epoch with the lowest validation loss — continuing only deepens overfitting", "Switch to a simpler model — rising validation loss always means the architecture is too large"], ans: 2
  },
  {
    id: 3, cat: "ML Foundations",
    q: "You split time-series trade data using standard k-fold, randomly shuffling rows first. What is the critical flaw?",
    opts: ["K-fold doesn't stratify by class — imbalanced trade outcomes will be unevenly distributed across folds", "Random shuffling destroys temporal order — training folds inadvertently contain future observations, inflating all performance estimates", "K-fold underestimates variance because each fold sees the full feature distribution", "K-fold assumes Gaussian labels — financial returns are fat-tailed, making fold statistics unreliable"], ans: 1
  },
  {
    id: 4, cat: "ML Foundations",
    q: "You run 50 feature-selection tests at p < 0.05. Eight features pass. You report them as significant. What is the flaw?",
    opts: ["p < 0.05 is too conservative for financial data — the industry standard is 0.10", "Sequential testing creates correlated subsets — the 8 features share information that should be penalised jointly", "50 tests at p < 0.05 expects ~2.5 false discoveries by chance — without multiple-testing correction, spurious features likely passed", "Significance confirms information content, not out-of-sample usefulness — the wrong criterion entirely"], ans: 2
  },
  {
    id: 5, cat: "ML Foundations",
    q: "You apply L1 regularisation to a linear return-prediction model. What is the key practical difference from L2?",
    opts: ["L1 penalises large weights more aggressively, making the model conservative near extreme returns", "L2 penalises the learning rate directly; L1 penalises weight magnitudes — they are effectively equivalent in practice", "L1 drives irrelevant weights exactly to zero, acting as embedded feature selection — L2 only shrinks weights", "L1 is only appropriate for classifiers — for continuous return regression, L2 is always preferred"], ans: 2
  },
  {
    id: 6, cat: "ML Foundations",
    q: "SHAP values explain a GBT model. For one specific trade, RSI_14 has a large positive SHAP value. What does this mean precisely?",
    opts: ["RSI_14 has the largest positive weight in the model's weight vector for this prediction", "For this observation, RSI_14 pushed the prediction higher relative to the baseline — a local explanation for this trade only", "RSI_14 is globally positively correlated with the target across all training data", "Removing RSI_14 would reduce model accuracy by approximately that SHAP magnitude"], ans: 1
  },
  {
    id: 7, cat: "ML Foundations",
    q: "Predicting intraday NIFTY returns from tabular features (RSI, volume ratios, bid-ask spread). GBT or LSTM — which is generally more robust?",
    opts: ["LSTM — it captures autocorrelation that a row-independent GBT cannot from static point-in-time features", "GBT — it handles missing values natively, critical for financial data with gaps from trading halts", "GBT — engineered tabular features already capture temporal structure; LSTM rarely outperforms GBT on structured financial data", "LSTM — raw price sequences can be fed directly, avoiding lookahead risk from manual feature construction"], ans: 2
  },
  {
    id: 8, cat: "ML Foundations",
    q: "You run 200 backtests varying hyperparameters and report the best result. Why is this problematic even if each individual backtest is clean?",
    opts: ["More than 100 backtests on the same dataset compounds the type I error rate beyond recovery", "Different hyperparameters define different model classes — cross-class comparison requires a different statistical framework", "Varying hyperparameters while holding data constant introduces lookahead — the chosen config depends on test outcomes", "Reporting the best of 200 results is implicit multiple testing — that Sharpe is the maximum of a distribution, making it systematically overoptimistic"], ans: 3
  },
  {
    id: 9, cat: "ML Foundations",
    q: "GBT on NIFTY options data: training loss = 0.02, validation loss = 0.19. What does this indicate and what is the fix?",
    opts: ["Underfitting — validation far exceeding training means insufficient capacity; increase depth and estimators", "Validation set is too small — below 500 samples, validation loss estimates are too noisy to interpret", "Overfitting — the large gap means the model memorised training data; reduce complexity via shallower trees or stronger regularisation", "Misspecified loss — financial returns require an asymmetric loss, not standard MSE"], ans: 2
  },
  {
    id: 10, cat: "ML Foundations",
    q: "IC = 0.08 in-sample on 2018–2022 data. IC drops to 0.01 when deployed in 2023. Most likely explanation?",
    opts: ["4 years is too few — IC estimates below 10 years of data are statistically unreliable by construction", "IC = 0.08 indicates in-sample overfitting — the Fundamental Law flags IC above 0.05 as an overfitting threshold", "2023 entered a different regime — the feature distributions the model learned no longer hold out-of-sample", "IC decay is normal — all models converge to IC ≈ 0 within 12 months of deployment"], ans: 2
  },
  {
    id: 11, cat: "Financial ML",
    q: "A feature uses a 20-day moving average. Row 10's feature uses days 1–20, but the label date is day 15. What has gone wrong?",
    opts: ["Window is too short — financial MAs need at least 50 periods to filter noise reliably", "The MA introduces autocorrelation that violates the IID assumption of most loss functions", "The feature uses data from after the label date — lookahead bias means the model trains on unavailable information", "Computing features across label boundaries inflates feature variance and distorts gradient descent"], ans: 2
  },
  {
    id: 12, cat: "Financial ML",
    q: "You normalise the full dataset (mean=0, std=1) before splitting into train/test. What is the leakage?",
    opts: ["Normalisation changes the sign of negative returns, distorting momentum feature direction", "Normalisation statistics are computed using test-set observations — the model has implicitly seen the test distribution during training", "Standardised features cannot be used with tree models, which need raw magnitudes for split thresholds", "Normalisation removes the autocorrelation structure that time-series models depend on"], ans: 1
  },
  {
    id: 13, cat: "Financial ML",
    q: "You fit PCA on the full dataset to reduce 150 features to 10 components, then split train/test. What is the leakage?",
    opts: ["PCA components are orthogonal — orthogonal features cannot share covariance with the test set by definition", "The PCA rotation embeds test-set covariance structure — test performance is overoptimistic because the components were fit on it", "PCA discards low-variance directions that contain regime-shift information critical for out-of-sample robustness", "PCA is invalid for financial data — non-Gaussian returns violate the elliptical distribution assumption"], ans: 1
  },
  {
    id: 14, cat: "Financial ML",
    q: "You tune hyperparameters on a validation set, then report performance on the same validation set as your out-of-sample estimate. What is wrong?",
    opts: ["The estimate is upward-biased — the config was chosen to maximise performance on this exact fold; a separate test set is required", "Tuning and evaluation use different objectives — selecting by loss and reporting Sharpe creates a metric mismatch", "Reusing the validation fold is only a problem with more than 5 hyperparameters — for GBT with 3–4, the bias is negligible", "The validation set should be excluded from all training — but reusing it for tuning doesn't bias performance, only hyperparameter selection"], ans: 0
  },
  {
    id: 15, cat: "Financial ML",
    q: "Momentum backtest Sharpe = 2.1. What is the single most important check before declaring success?",
    opts: ["Verify at least 100 trades per year — fewer makes the Sharpe confidence interval too wide to interpret", "Confirm the strategy is uncorrelated with the Nifty 50 — a high-beta strategy is redundant vs passive indexing", "Run on randomly permuted returns to verify the Sharpe is statistically impossible under the zero-edge null", "Confirm every signal used only data available at that moment — no retrospectively-adjusted prices or delayed publications used as real-time"], ans: 3
  },
  {
    id: 16, cat: "Financial ML",
    q: "You predict 5-day forward returns from daily rows. Adjacent rows share 4 label days. What is the problem?",
    opts: ["Adjacent rows share features from overlapping lookback windows — decorrelate with PCA before training", "Overlapping labels create serial correlation in the target — use non-overlapping labels or weight samples inversely to label overlap", "Label overlap inflates sample count 5×, causing the model to be under-regularised relative to the true sample size", "Overlapping returns violate the martingale property — use log-returns to restore the IID assumption"], ans: 1
  },
  {
    id: 17, cat: "Financial ML",
    q: "Your historical dataset contains only current NIFTY 50 constituents. What bias does training on this introduce?",
    opts: ["The model learns a large-cap tilt — current constituents skew high market-cap, disguising a size factor as an ML signal", "Current constituents have unusually stable features — the model underestimates deployment-period signal noise", "Removed constituents were mostly poor performers — the model trains on a positive-return biased sample, inflating backtest Sharpe", "Restricting to index members creates a sector concentration bias — the model learns sector effects, not instrument alpha"], ans: 2
  },
  {
    id: 18, cat: "Financial ML",
    q: "Walk-forward validation, 252-day train, 21-day test. What does 'purging' refer to?",
    opts: ["Removing instruments with corporate actions during the training window", "Discarding low-volume days from both windows to reduce noise near the boundary", "Excluding boundary observations whose label construction overlaps with the test window — preventing lookahead through the target variable", "Zeroing feature values in the final 5 training days to stabilise the feature distribution"], ans: 2
  },
  {
    id: 19, cat: "Financial ML",
    q: "You download quarterly EPS data today and backtest from 2015–2023. What is the critical data integrity problem?",
    opts: ["EPS must be adjusted for splits and dividends — unadjusted values misalign with price-based return calculations", "Earnings are released 30–45 days after quarter end — using the calendar quarter date introduces a systematic 30–45 day lookahead", "Databases correct EPS when companies restate — today's corrections weren't available at the original report date", "Today's download reflects retrospective revisions and restatements — the model trains on information no investor had at those historical dates"], ans: 3
  },
  {
    id: 20, cat: "Financial ML",
    q: "Raw daily closing prices are your input features for a return-prediction model. What is the core problem?",
    opts: ["Prices have too many decimal places — floating-point precision causes instability during gradient descent", "Prices are non-stationary — the feature distribution at inference will differ from training, causing systematic errors the model was never exposed to", "Prices are correlated across instruments — multicollinearity inflates feature importance estimates", "Tree models use fixed split thresholds — a rising price series pushes observations outside the trained split range"], ans: 1
  },
  {
    id: 21, cat: "Financial ML",
    q: "Classifier on 5-min NIFTY candles: 80% up, 20% down. Model gets 82% accuracy by always predicting 'up'. What should you do?",
    opts: ["Collect more data until the minority class exceeds 30% — accuracy becomes reliable below 70/30 imbalance", "Replace accuracy with F1 or precision-recall AUC — these penalise ignoring the minority class, unlike accuracy", "Add a softmax output layer — this calibrates class probabilities to reflect the true imbalance", "Switch to regression on return magnitude — continuous prediction sidesteps class imbalance entirely"], ans: 1
  },
  {
    id: 22, cat: "ML Foundations",
    q: "You want XGBoost to output calibrated probabilities — P(return > 0) = 0.7 should occur 70% of the time. Correct approach?",
    opts: ["Divide raw scores by the maximum score to compress them into [0,1]", "Apply Platt scaling or isotonic regression on a held-out calibration set — maps scores to proper probabilities without distorting rank order", "Apply sigmoid to raw scores — XGBoost uses logistic loss internally, so its output is already calibrated", "Calibration is only needed for exact probability applications — for trade ranking, raw scores are always sufficient"], ans: 1
  },
  {
    id: 23, cat: "Financial ML",
    q: "Your model's buy-signal class has precision = 0.85 and recall = 0.30. What does this tell you?",
    opts: ["The model is well-calibrated — high precision and recall above 0.25 is acceptable for financial classifiers", "When it fires, it is right 85% of the time — but it misses 70% of actual opportunities, capturing very little available alpha", "High precision with low recall is a known overfitting signature — the model memorised training labels", "Recall of 0.30 means 30% accuracy — barely better than random and should be discarded"], ans: 1
  },
  {
    id: 24, cat: "ML Foundations",
    q: "Model A has higher mean return; Model B has higher Sharpe. When would you prefer Model B?",
    opts: ["Never — higher mean return is the only metric that matters; volatility is managed separately through position sizing", "When capital preservation matters, leverage is limited, or drawdowns would breach risk limits — Sharpe captures whether return justifies the risk taken", "Only if both models have the same trade frequency — comparing Sharpe across different frequencies is misleading", "Model A for intraday, Model B for multi-day — this is the conventional mapping by holding period"], ans: 1
  },
  {
    id: 25, cat: "Financial ML",
    q: "Live Sharpe = 1.8 in months 1–6, then −0.3 in months 7–9. What should you investigate first?",
    opts: ["Quarterly hyperparameter retuning is overdue — this magnitude of decay typically signals the learning rate needs recalibration", "A regime change has occurred — market structure shifted and the model's features are no longer predictive; diagnose before retraining", "The 6-month Sharpe window is too short to distinguish decay from noise — extend to 3 years before acting", "Rolling Sharpe is downward-biased during high-vol periods — the denominator inflated, making the decline a measurement artefact"], ans: 1
  },
  {
    id: 26, cat: "Financial ML",
    q: "'Time_of_day' is your model's single most important feature. What should you investigate first?",
    opts: ["Tree models can't handle cyclic variables without sin/cos encoding — raw integers imply a false ordinal relationship that inflates importance", "It may proxy for structural patterns like open-auction liquidity or close rebalancing — determine if it is a genuine alpha source or a training artefact", "Time-of-day violates covariance stationarity — including it conditions the signal on intraday microstructure that changes across years", "High importance here is a known overfitting signal — remove it and check if validation Sharpe improves"], ans: 1
  },
  {
    id: 27, cat: "Financial ML",
    q: "200 candidate features, many correlated at r > 0.9. What is the primary risk of passing all into a linear model?",
    opts: ["Highly correlated features make the loss surface non-convex — the optimiser cycles without converging", "Multicollinearity makes coefficients unstable — correlated features can carry large opposing weights that cancel, hiding true predictive structure", "L2 regularisation automatically zeroes correlated features — the problem only arises without any regularisation", "Correlation inflates effective model capacity beyond the nominal hyperparameters, leaving the model under-regularised"], ans: 1
  },
  {
    id: 28, cat: "ML Foundations",
    q: "A continuous feature 'volume' ranks first in random forest MDI importance. A colleague says the score is inflated. Why might they be right?",
    opts: ["MDI scores continuous variables by their mean decrease in impurity across all possible splits — high-cardinality features get more split opportunities, inflating their apparent importance", "Volume correlates with price — correlated features always split their importance scores, so volume's display value understates its true standalone contribution", "MDI favours features used in early layers — volume appears near the root by coincidence of training order, not genuine importance", "MDI ranks by frequency of use across trees, not actual effect size — frequent use of a low-impact feature inflates its score"], ans: 0
  },
  {
    id: 29, cat: "ML Foundations",
    q: "Which approach correctly evaluates a model when you cannot afford a separate hold-out test set for a financial time-series?",
    opts: ["Train on all data and report training loss — with a large enough dataset, training loss approximates test loss", "Walk-forward cross-validation: train on expanding or rolling windows, test on sequential future blocks — temporal order is preserved and each test fold is genuinely out-of-sample", "Standard k-fold with stratification by market regime — stratification corrects for the temporal ordering problem in standard k-fold", "Use bootstrapping — randomly resample with replacement to create pseudo-test sets that approximate the true out-of-sample distribution"], ans: 1
  },
  {
    id: 30, cat: "ML Foundations",
    q: "You build a return-prediction model with 150 features. After training, only 10 features have non-zero weights. What regularisation was applied?",
    opts: ["L2 — it shrinks all weights proportionally toward zero, retaining only the strongest predictors", "Dropout — randomly zeroing neurons during training produces sparse weight vectors at convergence", "L1 — it drives irrelevant weights exactly to zero, producing a sparse model with automatic feature selection", "Early stopping — halting before convergence prevents small features from accumulating weight over time"], ans: 2
  },
  {
    id: 31, cat: "Financial ML",
    q: "A model trained on 2019–2022 data (bull, crash, recovery) faces a low-volatility sideways 2023 market. What distribution shift is this?",
    opts: ["Label shift — the proportion of profitable trades changed, so class priors are miscalibrated", "Concept drift — features are stationary but the relationship between features and returns reversed", "Covariate shift — the input feature distribution in deployment differs from training, so the model operates outside its calibrated region", "Overfitting — the model memorised regime-specific patterns rather than structural relationships"], ans: 2
  },
  {
    id: 32, cat: "ML Foundations",
    q: "A 500-tree random forest has no validation set. How does Out-of-Bag (OOB) error provide a reliable generalisation estimate?",
    opts: ["OOB evaluates each tree on training samples it didn't split on — these are still training samples, so OOB measures memorisation, not generalisation", "OOB averages error across all trees — averaging reduces variance, but introduces downward bias from the ensemble's smoothing effect", "Each bootstrap sample omits ~37% of observations — those unseen samples are aggregated into an OOB estimate equivalent to a hold-out, since each sample is only evaluated by trees that never saw it", "OOB uses only trees with low training loss — it is a pruning-adjusted training error, not a true generalisation estimate"], ans: 2
  },
  {
    id: 33, cat: "Financial ML",
    q: "A stock-return model applied to NIFTY 50 options degrades sharply despite similar feature distributions. Most likely cause?",
    opts: ["Options P&L is a non-linear function of direction, magnitude, moneyness, and time-to-expiry — a directional stock model captures none of this", "Feature normalisation was calibrated to equity magnitudes — options premiums fall outside those bounds, collapsing model predictions", "Stock models use daily bars; options require intraday granularity to capture theta decay near expiry", "The stock model ranks a cross-section — applied to a single option time series, the ranking objective is no longer valid"], ans: 0
  },
  {
    id: 34, cat: "Financial ML",
    q: "Your top feature IV_rank has shifted from a training-period mean of 45 to a live mean of 72. Correct operational response?",
    opts: ["Retrain immediately — a mean shift of this magnitude always means the model is outside its calibrated input range", "Recalibrate normalisation bounds, then assess whether prediction quality has actually degraded before retraining — a mean shift alone doesn't confirm model deterioration", "Remove IV_rank permanently — drifting features proxy regime changes and are unreliable across regimes", "Increase position size — higher IV means wider expected moves, improving the risk-reward of long-options positions"], ans: 1
  },
  {
    id: 35, cat: "ML Foundations",
    q: "GBT with max_depth=8, learning_rate=0.1 is overfitting. How do reducing max_depth and reducing learning_rate control overfitting through different mechanisms?",
    opts: ["Max depth controls tree count — reducing it limits total ensemble capacity; learning rate controls convergence speed and doesn't affect overfitting", "Both limit total ensemble weight — reducing either proportionally produces an equivalent regularisation effect", "Max depth limits feature interactions per tree — shallower trees capture fewer terms; a lower learning rate requires more trees for the same fit, making early stopping more precise", "Reducing max_depth to 1 eliminates overfitting entirely for datasets under 10,000 samples — learning rate only helps when depth is already minimal"], ans: 2
  },
  {
    id: 36, cat: "Financial ML",
    q: "Transaction costs: 3 bps per trade. Model generates 8 trades/day on ₹1 crore. What does this imply for viability?",
    opts: ["3 bps is below the materiality threshold — costs only matter when they exceed the instrument's average daily bid-ask spread", "Costs are symmetric — they reduce wins and losses equally, netting to zero Sharpe impact; only gross return matters", "8 × 3 bps × 250 days = 6,000 bps annual drag — the strategy needs an exceptionally high gross Sharpe to survive; reduce frequency first", "High-frequency strategies always benefit from compounding — the 6,000 bps drag is offset by the higher information ratio from frequent rebalancing"], ans: 2
  },
  {
    id: 37, cat: "Financial ML",
    q: "Strong buy signals on near-expiry CE options. Live fills are 15–20% worse than backtest prices. What assumption is failing?",
    opts: ["The backtest used mid-price — live buys fill at the ask, producing the 15–20% slippage, within normal bid-ask expectations", "Near-expiry options have very low delta — predicted underlying moves don't translate proportionally into option P&L at deep time decay", "Near-expiry options are illiquid with wide spreads — the backtest assumed last-traded price fills not achievable on thin order books", "Theta decay accelerates near expiry — the backtest didn't model holding costs, reducing realised P&L vs mark-to-market"], ans: 2
  },
  {
    id: 38, cat: "ML Foundations",
    q: "Online learning (update per observation) vs weekly batch retraining. When is online learning preferable for a trading model?",
    opts: ["Always — smaller, more frequent updates are universally more sample-efficient regardless of stationarity", "When regime is shifting rapidly and delayed updates are causing measurable live performance decay — update instability costs less than staleness", "When the process is stable and stationary — online learning converges faster under stationarity", "When the feature set changes frequently — batch retraining restarts the full pipeline each time a feature is added"], ans: 1
  },
  {
    id: 39, cat: "Financial ML",
    q: "RSI feature distribution has shifted significantly. Separately, out-of-sample IC dropped from 0.07 to 0.01. How should you interpret this together?",
    opts: ["Feature drift always causes concept drift — the IC drop is a direct consequence of the RSI shift; retrain immediately", "Feature drift is a change in input distribution; IC drop is degraded predictive performance — they may be related or independent; each requires separate investigation before acting", "IC drop is primary; RSI shift is a consequence — when return structure changes, RSI shifts as a lagging indicator; fix concept drift and the feature drift resolves", "Both signals measure the same phenomenon at different model layers — monitoring both is redundant; track only IC"], ans: 1
  },
  {
    id: 40, cat: "Financial ML",
    q: "Model generates buy signals for high-beta stocks before rallies. Excellent Sharpe, but attribution shows return = market beta, not alpha. Fix?",
    opts: ["Remove high-beta stocks from the universe — restricting to beta < 0.5 ensures zero systematic exposure by construction", "Regress predicted returns against the market return and subtract the fitted component — isolates the model's contribution from beta-driven returns", "Retrain using only sector-relative features — sector-relative signals cancel across the cross-section, implicitly hedging beta", "Reduce position size when signals are correlated across many stocks — correlation indicates response to a common factor"], ans: 1
  },
  {
    id: 41, cat: "ML Foundations",
    q: "Model A: lower training loss, higher validation loss. Model B: trains slower, generalises better. What principle explains B?",
    opts: ["Model B is underfitting — a model that trains slowly isn't learning training data well, so it ignores noise and generalises better", "Model B converged to a flatter loss surface minimum — flat minima generalise better because small weight perturbations produce smaller loss changes", "Model B has more parameters — larger models always generalise better as they can represent the true distribution more accurately", "Model B has more regularisation — any regularisation always reduces validation loss compared to no regularisation"], ans: 1
  },
  {
    id: 42, cat: "ML Foundations",
    q: "Five independently-trained models each have Sharpe 0.8. The ensemble has Sharpe ≈ 1.8. What statistical principle explains this?",
    opts: ["Ensembling averages training loss — overfitting models are down-weighted, leaving only the signal component", "Ensembling reduces max drawdown — the portfolio of signals diversifies away the worst model's contribution at any time", "If individual model errors are uncorrelated, the average's variance is 1/n of each model's — five uncorrelated models reduce prediction noise without needing better individual models", "Each model trained on different features — the ensemble spans the full feature space, improving coverage vs any single model"], ans: 2
  },
  {
    id: 43, cat: "ML Foundations",
    q: "1,000-tree GBT stops at tree 340 when validation loss rises. Why is early stopping an effective regulariser?",
    opts: ["It implements implicit L2 — shrinking gradients at each step is equivalent to weight decay, reducing the effective L2 coefficient", "Each tree fits residuals of all prior trees — stopping when validation rises prevents fitting residuals that are pure training noise, capping capacity without changing architecture", "It identifies the underfitting-to-overfitting transition — it restores the model to the last underfitting state, which has zero generalisation gap", "It removes trees with negative marginal validation contribution — pruning these from the ensemble leaves only trees that improve generalisation"], ans: 1
  },
  {
    id: 44, cat: "ML Foundations",
    q: "Two models, 95% negative / 5% positive class. Both report 95% accuracy. What additional evaluation is necessary?",
    opts: ["Increase dataset size — accuracy is only unreliable below 1,000 samples; with sufficient data, accuracy differentiates models reliably", "Evaluate precision, recall, and F1 on the minority class — a model predicting all-negative achieves 95% accuracy trivially without learning anything", "Retrain with class weights — imbalanced data requires weighted training before any metric comparison is valid", "Switch to log-loss — it is immune to class imbalance by construction and is always the correct replacement for accuracy on skewed datasets"], ans: 1
  },
  {
    id: 45, cat: "Financial ML",
    q: "A satellite imagery (foot traffic) feature has IC = 0.12 in year one, dropping to 0.02 by year three. Most likely explanation?",
    opts: ["Higher-resolution imagery in year three has different statistical properties — covariate shift degrades model performance", "Competing funds discovered and traded on the signal — arbitrage activity eroded the price inefficiency, reducing IC toward zero", "The underlying relationship weakened as e-commerce grew — foot traffic became less predictive as online sales offset in-store declines", "Three years of live trading introduced survivorship bias — stocks with declining foot traffic that performed well were retroactively added to training"], ans: 1
  },
  {
    id: 46, cat: "ML Foundations",
    q: "Expanding training window (all history up to T) vs fixed rolling window (last N months). What is the core tradeoff?",
    opts: ["Expanding windows guarantee distributional stationarity — rolling windows lose early-regime information that stabilises the feature-return mapping", "Expanding windows dilute regime-sensitivity by equally weighting distant history — rolling windows adapt faster but discard valid long-term structural patterns", "Rolling windows create leakage — the validation start falls within the training window because the window slides less than its length", "Expanding windows always produce higher out-of-sample Sharpe — rolling windows are only for strategies that retrain daily"], ans: 1
  },
  {
    id: 47, cat: "Financial ML",
    q: "Two uncorrelated signals, identical expected returns. Signal A: low return volatility. Signal B: high return volatility. Mean-variance weighting?",
    opts: ["Equal weights — identical expected returns mean mean-variance assigns equal capital regardless of volatility differences", "Signal A gets higher weight — mean-variance weights proportional to return / variance; lower volatility directly yields higher optimal allocation", "Signal B gets higher weight — higher volatility widens the return distribution, increasing the probability of large positive outcomes", "Weights depend on each signal's market beta — mean-variance cannot determine relative weights without knowing systematic exposure"], ans: 1
  },
  {
    id: 48, cat: "Financial ML",
    q: "Signal A: IC = 0.06 over 1 year. Signal B: IC = 0.04 over 5 years. Which do you trust more for deployment?",
    opts: ["Signal A — higher IC always indicates a stronger predictive relationship regardless of sample size", "Signal B — lower IC over a longer, more diverse period is a more reliable estimate of true predictive power; sample size and regime diversity matter as much as IC magnitude", "Neither — IC below 0.1 is statistically insignificant for financial models regardless of sample size", "Signal A — recent data is more relevant; a strong IC over the last year is more likely to persist than one calibrated over a distant 5-year window"], ans: 1
  },
  {
    id: 49, cat: "ML Foundations",
    q: "Random forest MDI ranks 'volume_ratio' first. A permutation importance test ranks it much lower. What does this suggest?",
    opts: ["Permutation importance is unreliable on financial data — random shuffling is sensitive to the random seed and produces unstable rankings", "MDI inflates high-cardinality continuous features because more split points give more opportunities to appear important — permutation importance better reflects true predictive contribution by directly measuring the effect of losing the feature", "The discrepancy means the model is overfitting to volume_ratio — both metrics must agree before a feature can be retained in production", "MDI and permutation importance measure different things by design and should never be expected to agree — reporting both is standard practice"], ans: 1
  },
  {
    id: 50, cat: "Financial ML",
    q: "Position sizing: size = signal × (target_vol / realized_vol). Why does dividing by realized_vol improve risk management?",
    opts: ["It converts the signal into a vol-adjusted probability — ensuring the output is properly calibrated across volatility regimes", "It normalises position sizes so expected P&L volatility is consistent across regimes — smaller in turbulent markets, larger in calm ones, targeting constant risk not constant notional", "It prevents overweighting high-vol instruments that would dominate portfolio returns through higher absolute return magnitude", "It Sharpe-ratio-weights each position — ensuring equal contribution to the portfolio's information ratio from each independent signal"], ans: 1
  }
];

var QUESTIONS_DB = [
  {
    id: 1, cat: "Database Design",
    q: "A trading system stores option premium prices that must never have floating-point rounding errors. Which data type is correct?",
    opts: ["FLOAT", "DOUBLE", "DECIMAL / NUMERIC", "BIGINT"], ans: 2
  },
  {
    id: 2, cat: "Creative DB Design",
    q: "An ML pipeline adds a new feature column to the trades table every sprint. After 18 months there are 130+ columns. What is the core structural problem?",
    opts: ["Schema becomes brittle — features should move to a separate feature-store table", "Indexes stop working beyond 100 columns", "The primary key will overflow", "VARCHAR columns auto-truncate at 100 entries"], ans: 0
  },
  {
    id: 3, cat: "Database Design",
    q: "A 400M-row order-book table is queried with WHERE timestamp BETWEEN t1 AND t2. Which index type is best suited for range scans?",
    opts: ["Hash index", "Full-text index", "B-Tree index", "Bitmap index"], ans: 2
  },
  {
    id: 4, cat: "Creative DB Design",
    q: "Compliance requires that every price update in the system be reconstructable to any past point in time. What schema pattern fulfils this?",
    opts: ["Update the row in-place and store only the latest value", "Use a nightly backup script", "Store a snapshot in a separate archive table weekly", "Append-only inserts with a recorded_at timestamp — never UPDATE or DELETE"], ans: 3
  },
  {
    id: 5, cat: "Database Design",
    q: "Both PRIMARY KEY and UNIQUE enforce no-duplicate values. What does PRIMARY KEY additionally guarantee that UNIQUE alone does not?",
    opts: ["It can reference foreign keys in other tables", "It can span multiple columns", "The column cannot contain NULL", "It always creates a clustered index in every database"], ans: 2
  },
  {
    id: 6, cat: "Creative DB Design",
    q: "15 analytics workers query the same positions table simultaneously during market hours, causing lock contention on the primary DB. What is the most scalable fix?",
    opts: ["Add read replicas or a caching layer so read traffic bypasses the primary", "Increase the size of the primary key to 64-bit", "Remove all indexes to reduce lock surface area", "Switch all column types from INT to VARCHAR"], ans: 0
  },
  {
    id: 7, cat: "Database Design",
    q: "A table has composite PK (order_id, product_id). Column supplier_name depends only on product_id, not the full composite key. Which normal form is violated?",
    opts: ["1NF", "2NF", "3NF", "BCNF"], ans: 1
  },
  {
    id: 8, cat: "Creative DB Design",
    q: "Two order-execution services simultaneously pick jobs from the same pending_orders table. What SQL mechanism prevents both from claiming the same row?",
    opts: ["A composite index on order_id and created_at", "A UNIQUE constraint on the status column", "SELECT … FOR UPDATE (pessimistic row-level lock)", "Increasing the auto-increment step to avoid collisions"], ans: 2
  },
  {
    id: 9, cat: "Database Design",
    q: "A fund transfer debits Account A and credits Account B. A crash occurs after the debit but before the credit. Which ACID property ensures both operations roll back together?",
    opts: ["Consistency", "Isolation", "Durability", "Atomicity"], ans: 3
  },
  {
    id: 10, cat: "Creative DB Design",
    q: "You store 1-minute OHLCV bars for 500 instruments. Queries are almost always for a single instrument over a date range. What is the most query-efficient schema design?",
    opts: ["One table per instrument (500 tables total)", "A single bars table with (instrument_id, timestamp) composite key, range-partitioned by date", "A JSON array column storing one day's bars per row", "A separate database per instrument"], ans: 1
  },
  {
    id: 11, cat: "Database Design",
    q: "A live order-entry system and an end-of-day P&L report generator — which workload types are these respectively?",
    opts: ["OLAP, OLTP", "OLAP, OLAP", "OLTP, OLAP", "OLTP, OLTP"], ans: 2
  },
  {
    id: 12, cat: "Creative DB Design",
    q: "Order history older than 6 months is queried rarely but must be retained for 7 years. Real-time queries need sub-5ms. How do you architect storage?",
    opts: ["Keep all rows in one table and keep adding RAM", "Replicate the full table to a second server every 6 months", "Index every column to make cold reads fast", "Archive old rows to cheaper cold storage; keep recent rows in the hot DB with date-based partitioning"], ans: 3
  },
  {
    id: 13, cat: "Database Design",
    q: "SELECT user_id, total FROM orders WHERE status = 'open'. An index on (status, user_id, total) exists. What is the specific performance gain?",
    opts: ["The table is auto-partitioned on first query", "The query is served entirely from the index — no table heap access needed", "Deadlocks on the table are prevented", "The query planner rewrites the SQL automatically"], ans: 1
  },
  {
    id: 14, cat: "Creative DB Design",
    q: "A junior engineer enforces 'every trade must belong to a valid portfolio' with a Python if-check. What is the architectural flaw?",
    opts: ["Direct DB writes, migrations, or other services bypass the app layer entirely — enforce with a FOREIGN KEY at DB level", "Python if-checks introduce too much latency in a trading system", "Foreign keys only work within the same microservice boundary", "Application layer is always the correct place for business rules"], ans: 0
  },
  {
    id: 15, cat: "Database Design",
    q: "You suspect a slow query is doing a sequential scan instead of using an index. In PostgreSQL, which command reveals actual execution time and real row counts?",
    opts: ["DESCRIBE query", "SHOW PLAN FOR query", "PROFILE query", "EXPLAIN ANALYZE query"], ans: 3
  },
  {
    id: 16, cat: "Creative DB Design",
    q: "A system ingests 80,000 market tick events per second. Rows are never updated or deleted. What schema principle matters most?",
    opts: ["Minimise index count to reduce write overhead — design for append-only inserts with time-based partitioning", "Add a UNIQUE constraint on every event column to prevent duplicates", "Use a single summary row and UPDATE it on each event", "Normalise to 4NF to minimise storage overhead"], ans: 0
  },
  {
    id: 17, cat: "Database Design",
    q: "Dropping a parent table that has child rows referencing it via FOREIGN KEY raises an error. What does this tell you?",
    opts: ["Foreign keys only enforce constraints on VARCHAR columns", "Foreign keys are checked only during SELECT queries", "Foreign keys protect referential integrity by blocking deletion of referenced parent rows", "Foreign keys block all INSERT operations on the child table"], ans: 2
  },
  {
    id: 18, cat: "Creative DB Design",
    q: "A portfolio summary query ran in 1s on 500K rows. After 18 months it takes 4 minutes on 90M rows. No code changed. Most likely cause?",
    opts: ["The database connection pool is exhausted", "The server timezone was updated during a maintenance window", "A VARCHAR column silently converted to TEXT", "The query now triggers a full table scan — the index is not selective enough at this data volume"], ans: 3
  },
  {
    id: 19, cat: "Database Design",
    q: "Transaction A reads a balance. Transaction B updates and commits it. Transaction A reads again in the same transaction and gets a different value. What is this anomaly called?",
    opts: ["Dirty read", "Non-repeatable read", "Phantom read", "Lost update"], ans: 1
  },
  {
    id: 20, cat: "Database Design",
    q: "A users table has 60 columns. profile_bio and avatar_url are large BLOBs rarely accessed — most queries only need id, name, email. What design improves performance?",
    opts: ["Add a hash index on profile_bio", "Increase the VARCHAR limit so large columns don't overflow", "Merge all rarely-used columns into one JSON blob column", "Move infrequently accessed large columns to a separate table (vertical partitioning)"], ans: 3
  },
  {
    id: 21, cat: "Database Design",
    q: "MySQL InnoDB uses a clustered index so rows are physically ordered by primary key. What is the key implication of using a random UUID as the primary key?",
    opts: ["Random UUIDs cause page fragmentation and slow inserts — rows cannot be appended sequentially to the leaf pages", "UUIDs are too short to serve as primary keys", "Clustered indexes only work with integer keys", "Non-clustered indexes stop functioning when UUIDs are used"], ans: 0
  },
  {
    id: 22, cat: "Creative DB Design",
    q: "You need to add a NOT NULL column to a 300M-row production table with zero downtime. What is the safest migration approach?",
    opts: ["ALTER TABLE ADD COLUMN NOT NULL — it's instant in all modern databases", "Drop and recreate the table with the new schema", "Add the column as nullable first, backfill data in batches, then add the NOT NULL constraint separately", "Pause all application writes, run migration, then resume"], ans: 2
  },
  {
    id: 23, cat: "Database Design",
    q: "Under the CAP theorem, during a network partition a distributed system must sacrifice one of two properties. Which two does it choose between?",
    opts: ["Atomicity and Durability", "Consistency and Availability", "Consistency and Partition Tolerance", "Availability and Atomicity"], ans: 1
  },
  {
    id: 24, cat: "Creative DB Design",
    q: "An order submission service retries on network failure and may send the same order twice. What DB-level pattern prevents duplicate orders?",
    opts: ["A unique idempotency key on the orders table so duplicate inserts are rejected or ignored silently", "Storing orders as VARCHAR so the app layer can detect duplicates", "Using a FLOAT primary key to absorb collisions", "Increasing the connection pool size to reduce retry probability"], ans: 0
  },
  {
    id: 25, cat: "Database Design",
    q: "Process A holds a lock on Row 1 and waits for Row 2. Process B holds Row 2 and waits for Row 1. What is this condition and how do databases typically resolve it?",
    opts: ["Race condition — resolved by increasing the query timeout", "Stale read — resolved by MVCC", "Dirty read — resolved by READ COMMITTED isolation", "Deadlock — the DB detects the cycle and rolls back one of the transactions"], ans: 3
  },
  {
    id: 26, cat: "Creative DB Design",
    q: "You log raw JSON payloads from a third-party data feed — the schema changes often and queries are simple lookups by event_id. Which database type fits best?",
    opts: ["Relational DB with strict schema and foreign keys", "Graph database optimised for relationship traversal", "Document store or key-value store — schema-flexible and suited to high-write, simple-lookup workloads", "Columnar warehouse optimised for aggregation queries"], ans: 2
  },
  {
    id: 27, cat: "Database Design",
    q: "Which transaction isolation level completely eliminates dirty reads, non-repeatable reads, and phantom reads — at the cost of maximum lock contention?",
    opts: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"], ans: 3
  },
  {
    id: 28, cat: "Creative DB Design",
    q: "Opening a fresh DB connection per API request adds 80ms overhead. The service handles 2,000 requests/second. What is the standard solution?",
    opts: ["Use a connection pool — reuse a fixed set of persistent connections across requests", "Increase database server RAM to absorb connection overhead", "Switch from TCP to UDP for lower handshake latency", "Add an index on the connections metadata table"], ans: 0
  },
  {
    id: 29, cat: "Database Design",
    q: "A column called is_active holds only TRUE or FALSE across 50M rows. You add a B-Tree index on it. Why will the query planner likely ignore it?",
    opts: ["B-Tree indexes cannot store boolean values", "The index file will exceed the table size on disk", "Boolean columns are auto-indexed by the database engine", "Low cardinality means the index offers almost no selectivity — a full scan is often cheaper"], ans: 3
  },
  {
    id: 30, cat: "Creative DB Design",
    q: "A fully normalised schema with 10 joined tables runs a dashboard query in 9 seconds. A pre-computed summary table reduces it to 60ms. What principle does this illustrate?",
    opts: ["Normalisation is always wrong in production systems", "Summary/materialised views violate ACID and should be avoided", "Denormalisation trades write complexity and storage for read performance — a valid pattern for read-heavy analytics", "Joins should be replaced with application-side merges"], ans: 2
  },
  {
    id: 31, cat: "Database Design",
    q: "An index exists on (status, created_at). A query runs WHERE created_at > '2024-01-01' without filtering on status at all. Will this index be used efficiently?",
    opts: ["Yes — PostgreSQL's index-skip scan lets the planner use any column in a composite index regardless of order", "No — the leading column is status; queries not filtering on it cannot use this index efficiently", "Yes — the query planner rewrites predicates to match the index column order automatically", "No — composite indexes only work when all indexed columns appear in the WHERE clause"], ans: 1
  },
  {
    id: 32, cat: "Database Design",
    q: "PostgreSQL uses MVCC (Multi-Version Concurrency Control). What is the primary operational benefit for a system with heavy concurrent reads and writes?",
    opts: ["It allows the DB to bypass the WAL during reads, reducing I/O under heavy concurrency", "It enables automatic read-replica promotion when the primary is under load", "Readers never block writers and writers never block readers — each transaction sees a consistent point-in-time snapshot", "It prevents deadlocks by serialising conflicting transactions through a central lock manager"], ans: 2
  },
  {
    id: 33, cat: "Database Design",
    q: "A trades table has 50M rows. 99% have status = 'closed', only 1% have status = 'open'. Queries almost exclusively filter for open trades. What is the most efficient index strategy?",
    opts: ["A full B-Tree index on status — the planner will skip closed rows automatically", "A hash index on status for O(1) equality lookups on open trades", "A composite index on (status, trade_id) so the planner can use an index-only scan", "A partial index WHERE status = 'open' — indexes only the 1% of rows that queries actually touch"], ans: 3
  },
  {
    id: 34, cat: "Database Design",
    q: "In PostgreSQL, UPDATE and DELETE leave dead tuples behind rather than reclaiming space immediately. What mechanism removes them?",
    opts: ["VACUUM — removes dead tuples, updates visibility maps, and reclaims space for reuse", "AUTOVACUUM runs ANALYZE on the table, which identifies and removes dead tuples as a side effect", "REINDEX — rebuilds index pages and purges dead tuple references embedded in them", "ANALYZE — collects table statistics and frees dead tuple space as part of the scan"], ans: 0
  },
  {
    id: 35, cat: "Database Design",
    q: "A nightly P&L aggregation joins 8 tables and takes 2 minutes. It powers a dashboard refreshed every 10 minutes. What is the right database-level solution?",
    opts: ["Run the 2-minute query live on every dashboard load and cache results in the application layer", "A regular VIEW — the database re-evaluates it on each access but caches the query plan", "A materialized view — pre-compute and persist the result, refreshed on a defined schedule", "Add covering indexes on all 8 tables — join performance will improve proportionally to the index count"], ans: 2
  },
  {
    id: 36, cat: "Database Design",
    q: "PostgreSQL's Write-Ahead Log (WAL) primarily guarantees crash recovery. What is its key secondary role in a production trading system?",
    opts: ["It serialises all concurrent writes through a single queue, preventing write-write conflicts between sessions", "It maintains a read buffer of recently committed rows so replicas can serve reads without contacting the primary", "It is streamed to standby servers, enabling hot-standby replication and point-in-time recovery", "It checkpoints dirty pages to disk on a schedule, reducing the I/O cost of fsync on commit"], ans: 2
  },
  {
    id: 37, cat: "Database Design",
    q: "EXPLAIN ANALYZE shows 'Bitmap Index Scan → Bitmap Heap Scan' on a query. What does this execution pattern indicate?",
    opts: ["The planner fell back to a sequential scan after the index scan returned too many rows", "The index is being rebuilt in the background while the query runs using a shadow copy", "The planner combined multiple index ranges into an in-memory bitmap before fetching heap pages — efficient for moderate result set sizes", "Two separate indexes are being merged via a hash join before the table is accessed"], ans: 2
  },
  {
    id: 38, cat: "Database Design",
    q: "A trades table uses trade_ref (business-assigned alphanumeric) as the primary key. What is the principal risk?",
    opts: ["String primary keys always produce a non-clustered heap layout, adding an extra lookup per query in InnoDB", "Sequential integer keys are more cache-friendly, making string PKs significantly slower for range scans", "Alphanumeric keys create page fragmentation at the same rate as random UUIDs, regardless of the assignment pattern", "Business keys can change or be reassigned — updates cascade through all foreign key references, causing fragility and inconsistency"], ans: 3
  },
  {
    id: 39, cat: "Creative DB Design",
    q: "You must retrieve all ticks for a single instrument between 9:15 and 9:30 AM from a 2-billion-row tick table in under 20ms. What combination makes this feasible?",
    opts: ["A hash index on instrument_id for O(1) instrument lookup, combined with a sequential scan of the resulting rows for the time range", "Range partitioning by date alone, with a B-Tree index on instrument_id within each partition", "A covering index on (event_time, instrument_id) — covering indexes eliminate all heap access, making any query instant", "Composite index on (instrument_id, event_time) with date-range partitioning so the scan touches only one partition"], ans: 3
  },
  {
    id: 40, cat: "Creative DB Design",
    q: "Your backtesting engine must reconstruct the exact market state at any arbitrary historical timestamp. Which design approach makes this possible without data loss?",
    opts: ["Store daily OHLCV snapshots — replay accuracy degrades gracefully within each day's window", "Overwrite order book state in-place and maintain a change-log table populated by DB triggers", "Use an event-sourced append-only log of every market event — replay from any point T to reconstruct exact state", "Take minute-level snapshots and use linear interpolation for sub-minute precision"], ans: 2
  },
  {
    id: 41, cat: "Creative DB Design",
    q: "You need to trace any filled trade back through the full chain — signal triggered it, strategy generated the signal, model produced the feature. What schema design enables this audit trail?",
    opts: ["Store all fields (model_id, strategy_id, signal_id, trade_id) as denormalised columns in one trades row", "A normalised chain of linked tables: models → strategies → signals → orders → trades, joined by foreign key at each step", "Store lineage as a JSONB column on the trades table — flexible and queryable without schema changes", "Use a graph database for lineage — relational DBs cannot efficiently traverse directed chains of this depth"], ans: 1
  },
  {
    id: 42, cat: "Creative DB Design",
    q: "You store the full NIFTY50 options chain — multiple expiries, strikes, CE and PE. Queries filter by expiry and strike. What is the cleanest schema?",
    opts: ["One table per expiry date — keeps each expiry's data isolated and avoids cross-expiry scans", "A single options_chain table with (underlying, expiry_date, strike, option_type) as composite key, indexed on (underlying, expiry_date, strike)", "Partition the options_chain table by option_type (CE/PE) — puts and calls have different Greeks and should be physically separated", "Normalise into three tables (underlyings, expiries, strikes) joined at query time to avoid data duplication"], ans: 1
  },
  {
    id: 43, cat: "Creative DB Design",
    q: "Market data from a slow feed arrives 30 seconds late and must be stored with the original event timestamp, not the wall-clock write time. What schema correctly handles this?",
    opts: ["Two timestamps per row: event_time (when the event occurred) and ingested_at (when written to DB) — always query and sort on event_time", "Store only ingested_at and subtract the known feed latency at query time to recover approximate event timing", "Reject late-arriving rows — insert them instead into a reconciliation table and merge nightly via a scheduled job", "Stage late-arriving rows in a buffer table and merge them into the main time-series table sorted by event_time during off-peak hours"], ans: 0
  },
  {
    id: 44, cat: "Creative DB Design",
    q: "Daily P&L can always be derived as (exit_price − entry_price) × quantity. When is it justified to store this as a persisted column?",
    opts: ["Never — any derived value that can drift from its inputs will cause reconciliation failures over time", "When the field is frequently queried, used in filters or ORDER BY, or expensive to recompute across tens of millions of rows", "Only when the inputs (prices, quantities) are immutable after settlement — mutable inputs make stored derivations unsafe", "Store it only if DECIMAL precision is required — integer arithmetic can always be derived safely at query time"], ans: 1
  },
  {
    id: 45, cat: "Creative DB Design",
    q: "A tick database is growing past 5TB. What is the key tradeoff between sharding by instrument_id versus sharding by date range?",
    opts: ["Instrument sharding co-locates each instrument's history (fast per-instrument queries) but risks write hotspots if a few instruments dominate volume; date sharding distributes writes evenly but forces cross-shard fan-out for single-instrument history", "Instrument sharding should always be chosen — financial queries are almost always scoped to a single instrument, making cross-shard fan-out irrelevant", "Date sharding should always be chosen — even distribution guarantees lower tail latency under any query pattern", "A composite shard key of (instrument_id % N, date % M) eliminates hotspots in both dimensions simultaneously"], ans: 0
  },
  {
    id: 46, cat: "Creative DB Design",
    q: "An order moves through states: submitted → acknowledged → partially_filled → filled. Should you UPDATE a single orders row, or use an append-only state event log?",
    opts: ["UPDATE the single row — simpler schema, and a DB trigger can snapshot changes to an audit table if history is ever needed", "Append-only event log — full history preserved, replay possible, and concurrent updates cannot silently overwrite each other", "Snapshot the mutable orders row to an orders_history table on each state change using a DB trigger", "Keep the mutable row but emit state transitions to a message queue; consume them downstream for audit if required"], ans: 1
  },
  {
    id: 47, cat: "Creative DB Design",
    q: "Your platform has 20 microservices, each with a connection pool of 50. PostgreSQL max_connections = 200. What is the risk at peak load?",
    opts: ["No risk — each pool is capped at 50, so the total active connections stays within bounds at any given moment", "Connections beyond the limit queue invisibly inside the OS TCP stack until a slot opens", "At peak, 20 × 50 = 1,000 simultaneous connection attempts against a 200-connection limit causes connection refusals and cascading failures", "The application-level pool negotiates with pg_bouncer internally to stay under the server limit"], ans: 2
  },
  {
    id: 48, cat: "Database Design",
    q: "A query runs WHERE DATE(created_at) = '2024-01-15' on a timestamptz column. A B-Tree index on created_at exists but the planner does a sequential scan. Why?",
    opts: ["The B-Tree index has become stale since the last ANALYZE run — refreshing statistics will restore index usage", "Wrapping a column in DATE() makes it opaque to the planner — a functional index on DATE(created_at) or a range rewrite is needed", "The session timezone differs from the storage timezone, forcing a full scan to resolve implicit conversions before filtering", "B-Tree indexes on timestamptz columns only activate for range predicates (> or <), not equality predicates"], ans: 1
  },
  {
    id: 49, cat: "Database Design",
    q: "A strategy reads its own freshly written signal from a read replica and finds nothing — even though it was just committed to the primary. What consistency problem is this?",
    opts: ["Dirty read — the replica hasn't yet replayed the uncommitted WAL record", "Phantom read — a concurrent transaction deleted the signal between the write and read", "Serialisation anomaly — the read and write transactions executed in an order that breaks serializability", "Read-your-writes violation — the write committed on the primary but replica lag means the replica hasn't applied it yet"], ans: 3
  },
  {
    id: 50, cat: "Creative DB Design",
    q: "Six months after go-live, backtests produce different results than the live system produced at the same time. Schema and data have been mutated in-place over time. What is the root cause and correct design?",
    opts: ["Updated table statistics from ANALYZE runs caused the query planner to choose different execution paths in backtest vs live", "Backtesting needs an immutable point-in-time snapshot of both schema and data — in-place mutations destroy historical reproducibility", "The backtest is running on a read replica with replication lag, causing it to read a slightly stale dataset", "Index fragmentation has accumulated on the backtest tables, causing different rows to be returned in a different order"], ans: 1
  }
];

// ─── Category metadata ────────────────────────────────────────────────────────
var CAT_META_ML = {
  "ML Foundations": { badge: "cat-badge-ml" },
  "Financial ML": { badge: "cat-badge-ml" }
};
var CAT_META_DB = {
  "Database Design": { badge: "cat-badge-db" },
  "Creative DB Design": { badge: "cat-badge-db" }
};

// ─── State ────────────────────────────────────────────────────────────────────
window.isTestActive = false;
var currentTrack = null;   // 'ml' | 'db'
var currentQs = [];
var currentIdx = 0;
var answers = [];     // index → chosen option index (or null)
var timerInterval = null;
var timeLeft = 30 * 60; // 30 minutes
var totalTime = 30 * 60;
var startTime = null;
var finishTime = null;

// ─── Force Start & Active Lock ─────────────────────────────────────────────────
(function () {
  var _active = localStorage.getItem('current_assessment_active');

  // ─── Force Submission & Start Rule (3 min) ───────────────────────────────
  var _subTime = parseInt(localStorage.getItem('submissionTime') || '0');
  var _now = Date.now();
  var _MAX_WAIT = 60 * 60 * 1000;

  if (_subTime === 0) {
    window.location.href = '/';
    return;
  }

  if ((_now - _subTime) > _MAX_WAIT && localStorage.getItem('tf_assessment_stage') < 3) {
    var track = document.getElementById('screen-track');
    if (track) {
      track.innerHTML = buildCompletedBanner(
        '⏰ Time Expired',
        'You must start assessments within 60 minutes of form submission.',
        [{ label: 'Return to Application', href: '/' }]
      );
      track.classList.add('active');
    }
    document.querySelectorAll('.psych-screen:not(#screen-track)').forEach(function (s) { s.style.display = 'none'; });
    return;
  }

  // ─── Stage-Based Locking ──────────────────────────────────────────────────
  var _stage = parseInt(localStorage.getItem('tf_assessment_stage') || '0');
  if (_stage < 2) {
    window.location.href = '/iq_assessment.html';
    return;
  }

  if (_stage >= 3) {
    var track = document.getElementById('screen-track');
    if (track) {
      track.innerHTML = buildCompletedBanner(
        '⚡ Technical Assessment',
        'You have already completed this assessment.',
        [{ label: 'Games Assessment →', href: '/games.html' }]
      );
      track.classList.add('active');
    }
    document.querySelectorAll('.psych-screen:not(#screen-track)').forEach(function (s) { s.style.display = 'none'; });
    return;
  }

  // ─── Prevent Round Switching ──────────────────────────────────────────────
  if (_active && _active !== 'skillset') {
    window.location.href = _active === 'games' ? '/games.html' : '/' + _active + '_assessment.html';
    return;
  }

  // Resume Check
  var _skTrack = localStorage.getItem('sk_track');
  var _skStartTime = parseInt(localStorage.getItem('sk_start_time') || '0');
  if (_active === 'skillset' && _skTrack && _skStartTime > 0) {
    currentTrack = _skTrack;
    currentQs = currentTrack === 'ml' ? QUESTIONS_ML : QUESTIONS_DB;
    var saved = localStorage.getItem('tf_sk_answers');
    if (saved) {
      try {
        var arr = JSON.parse(saved);
        if (Array.isArray(arr)) answers = arr;
      } catch (_) { }
    }
    if (answers.length === 0) answers = new Array(currentQs.length).fill(null);
    window.isTestActive = true;
    window.onbeforeunload = function () { if (window.isTestActive) return "Assessment in progress."; };
    startTime = _skStartTime;
    // Delay slightly to ensure DOM ready
    setTimeout(function () {
      showScreen('screen-question');
      renderQuestion(0);
      startTimer();
    }, 50);
    return;
  }


})();

// ─── Screen helpers ───────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.psych-screen').forEach(function (s) {
    s.classList.remove('active');
  });
  var el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ─── Track selection ──────────────────────────────────────────────────────────
function selectTrack(track) {
  currentTrack = track;
  document.getElementById('track-ml').classList.toggle('selected', track === 'ml');
  document.getElementById('track-db').classList.toggle('selected', track === 'db');
  var btn = document.getElementById('track-start-btn');
  btn.disabled = false;
  btn.style.opacity = '1';
}

function goToIntro() {
  if (!currentTrack) return;
  currentQs = currentTrack === 'ml' ? QUESTIONS_ML : QUESTIONS_DB;
  answers = new Array(currentQs.length).fill(null);

  var title = currentTrack === 'ml' ? 'Financial ML Assessment' : 'Database Engineering Assessment';
  var subtitle = '50 questions · 30-minute countdown · you may skip any question';

  document.getElementById('intro-title').textContent = title;
  document.getElementById('intro-subtitle').textContent = subtitle;

  var cats = {};
  currentQs.forEach(function (q) { cats[q.cat] = (cats[q.cat] || 0) + 1; });
  var catsHtml = '';
  Object.entries(cats).forEach(function (e) {
    catsHtml += '<div class="cat-summary-card"><div class="cat-name">' + e[0] + '</div>'
      + '<div class="cat-count">' + e[1] + ' Q</div></div>';
  });
  document.getElementById('intro-cats').innerHTML = catsHtml;

  showScreen('screen-intro');
}

// ─── Assessment ───────────────────────────────────────────────────────────────
function startAssessment() {
  localStorage.setItem('current_assessment_active', 'skillset');
  localStorage.setItem('sk_track', currentTrack);
  localStorage.setItem('sk_start_time', Date.now().toString());
  window.isTestActive = true;
  startTime = Date.now();
  // Warn before leaving
  window.onbeforeunload = function () {
    if (window.isTestActive) return "Assessment in progress. Your changes will be lost if you leave.";
  };

  // Re-apply global sidebar lock
  if (window.applySidebarLock) window.applySidebarLock();

  currentIdx = 0;
  timeLeft = totalTime;
  renderQuestion();
  showScreen('screen-question');
  startTimer();
}

function renderQuestion() {
  var q = currentQs[currentIdx];
  var catMeta = currentTrack === 'ml' ? CAT_META_ML : CAT_META_DB;
  var badge = (catMeta[q.cat] || {}).badge || 'cat-badge-ml';

  document.getElementById('sk-q-num').textContent = 'Question ' + (currentIdx + 1) + ' of ' + currentQs.length;
  var catEl = document.getElementById('sk-q-cat-badge');
  catEl.textContent = q.cat;
  catEl.className = 'cat-badge-sk ' + badge;

  document.getElementById('sk-q-title').textContent = q.q;

  var LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  var html = '';
  q.opts.forEach(function (opt, i) {
    var chosen = answers[currentIdx] === i;
    html += '<div class="sk-option' + (chosen ? ' chosen' : '') + '" onclick="selectAnswer(' + i + ')">'
      + '<div class="sk-opt-letter">' + LETTERS[i] + '</div>'
      + '<div class="sk-opt-text">' + opt + '</div>'
      + '</div>';
  });
  document.getElementById('sk-q-options').innerHTML = html;

  document.getElementById('sk-prev-btn').style.display = currentIdx > 0 ? 'inline-flex' : 'none';
  document.getElementById('sk-next-btn').style.display = currentIdx < currentQs.length - 1 ? 'inline-flex' : 'none';
  document.getElementById('sk-finish-btn').style.display = currentIdx === currentQs.length - 1 ? 'inline-flex' : 'none';

  renderNumberGrid();
}

function selectAnswer(optIdx) {
  answers[currentIdx] = optIdx;
  localStorage.setItem('tf_sk_answers', JSON.stringify(answers));
  renderQuestion();
}

function skNav(dir) {
  var next = currentIdx + dir;
  if (next >= 0 && next < currentQs.length) {
    currentIdx = next;
    renderQuestion();
  }
}

function renderNumberGrid() {
  var html = '';
  currentQs.forEach(function (_, i) {
    var cls = 'q-num-btn';
    if (i === currentIdx) cls += ' active';
    else if (answers[i] !== null) cls += ' answered';
    html += '<button class="' + cls + '" onclick="jumpTo(' + i + ')">' + (i + 1) + '</button>';
  });
  document.getElementById('sk-number-grid').innerHTML = html;
}

function jumpTo(idx) {
  currentIdx = idx;
  renderQuestion();
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(function () {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeLeft = Math.max(0, totalTime - elapsed);
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResults();
    }
  }, 1000);
  updateTimerDisplay();
}

function updateTimerDisplay() {
  var m = Math.floor(timeLeft / 60);
  var s = timeLeft % 60;
  document.getElementById('sk-timer-num').textContent =
    m + ':' + (s < 10 ? '0' : '') + s;
  var pct = (timeLeft / totalTime) * 100;
  var bar = document.getElementById('sk-timer-bar');
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = pct > 50 ? '#00d4ff'
      : pct > 20 ? '#ffcc44'
        : '#ff6b6b';
  }
}

// ─── Results ─────────────────────────────────────────────────────────────────
function showResults() {
  window.isTestActive = false;
  window.onbeforeunload = null;
  finishTime = Date.now();

  if (timerInterval) clearInterval(timerInterval);
  localStorage.setItem('tf_assessment_stage', '3'); // Move to stage 3
  localStorage.removeItem('current_assessment_active');
  localStorage.removeItem('sk_start_time');
  localStorage.removeItem('sk_track');
  localStorage.removeItem('tf_sk_answers');

  var score = 0;
  currentQs.forEach(function (q, i) {
    if (answers[i] === q.ans) score++;
  });
  var pct = Math.round(score / currentQs.length * 100);
  var timeTakenSec = Math.floor((finishTime - startTime) / 1000);

  var correct = 0;
  var catStats = {};

  currentQs.forEach(function (q, i) {
    if (!catStats[q.cat]) catStats[q.cat] = { correct: 0, total: 0 };
    catStats[q.cat].total++;
    if (answers[i] === q.ans) {
      correct++;
      catStats[q.cat].correct++;
    }
  });

  var total = currentQs.length;
  var tier = pct >= 80 ? 'Strong Pass' : pct >= 60 ? 'Borderline' : 'Does Not Meet Bar';
  var color = pct >= 80 ? '#00ff88' : pct >= 60 ? '#ffcc44' : '#ff6b6b';

  document.getElementById('sk-res-score').textContent = pct + '%';
  document.getElementById('sk-res-correct').textContent = correct + ' / ' + total;
  var tierEl = document.getElementById('sk-res-tier');
  tierEl.textContent = tier;
  tierEl.style.color = color;

  var catHtml = '';
  Object.entries(catStats).forEach(function (e) {
    var cat = e[0];
    var stat = e[1];
    var cp = Math.round((stat.correct / stat.total) * 100);
    var cls = cp >= 80 ? '' : cp >= 60 ? 'mid' : 'low';
    catHtml += '<div class="res-cat-row">'
      + '<span class="res-cat-name">' + cat + '</span>'
      + '<span class="res-cat-score ' + cls + '">'
      + stat.correct + '/' + stat.total + ' (' + cp + '%)</span>'
      + '</div>';
  });
  document.getElementById('sk-res-by-category').innerHTML = catHtml;

  // Save skillset score to localStorage for final submission
  var resData = {
    track: currentTrack,
    score: score,
    correct: score,
    total: currentQs.length,
    pct: pct,
    tier: tier,
    time_taken: timeTakenSec,
    responses: answers
  };
  localStorage.setItem('tf_skillset', JSON.stringify(resData));
  localStorage.setItem('sk_completed', 'true'); // lock skillset from retry

  // NEW: Persist to backend if email is available
  try {
    var cache = JSON.parse(localStorage.getItem('formCache') || '{}');
    if (cache.email && window.apiSubmitAssessment) {
      window.apiSubmitAssessment(cache.email, 'skillset', resData);
    }
  } catch (e) {
    console.error('Failed to persist Skillset results:', e);
  }

  showScreen('screen-results');

  // Hide retry button — assessment is locked once results are shown
  var retryBtn = document.querySelector('#screen-results .nav-btn.prev-btn, #screen-results button[onclick*="retry"]');
  if (retryBtn) retryBtn.style.display = 'none';
}

function retryAssessment() {
  // Retry is disabled — once results are shown the assessment is locked
  console.warn('Retry is not allowed after completing the assessment.');
  answers = new Array(currentQs.length).fill(null);
  currentIdx = 0;
  timeLeft = totalTime;
  renderQuestion();
  showScreen('screen-question');
  startTimer();
}
