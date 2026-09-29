// Curriculum data only: no rendering logic lives here.
// Lessons are added to LESSONS one at a time as we work through them together.

export const DIFFICULTY = {
  beginner: { label: "Beginner", dot: "🟢" },
  intermediate: { label: "Intermediate", dot: "🟡" },
  advanced: { label: "Advanced", dot: "🟠" },
  engineering: { label: "Engineering Challenge", dot: "🔴" },
};

export const PHASES = [
  {
    id: "p0", num: 0, key: "computing", title: "Computing Fundamentals", short: "Computing",
    difficulty: "beginner",
    why: "Every abstraction you will use later (Python, NumPy, PyTorch, APIs, MCP) sits on top of these. Knowing them turns mysterious errors into obvious ones.",
    topics: ["What programs are", "CPU", "RAM", "Storage", "Processes", "Files", "Operating systems", "Terminal", "Environment variables", "Packages", "APIs", "JSON", "HTTP", "Client/server", "Git", "GitHub", "Virtual environments"],
    project: "System Information CLI",
  },
  {
    id: "p1", num: 1, key: "python", title: "Python from Zero", short: "Python",
    difficulty: "beginner",
    why: "Python is the glue language of data and AI. You will write every later project in it.",
    topics: ["Variables", "Data types", "Numbers", "Strings", "Boolean & None", "Operators", "Type conversion", "Input/output", "Conditions", "Loops", "Lists", "Tuples", "Sets", "Dictionaries", "Functions", "Scope", "Arguments & return", "Lambda", "Comprehensions", "Modules & packages", "Exceptions", "File handling", "CSV", "JSON"],
    project: "CLI Calculator → Expense Analyzer → CSV Analyzer",
  },
  {
    id: "p1b", num: 1.5, key: "python-int", title: "Intermediate Python", short: "Python+",
    difficulty: "intermediate",
    why: "The tools that make code maintainable, testable and fast, and that libraries like PyTorch use everywhere.",
    topics: ["Iterators", "Generators", "Decorators", "Context managers", "Dataclasses", "Type hints", "OOP", "Inheritance vs composition", "Abstract classes", "Properties", "Magic methods", "Testing", "Logging", "Debugging", "Async", "Threads vs processes", "Memory", "Performance"],
    project: "Portfolio Tracker → API Client → Stock-Data Downloader",
  },
  {
    id: "p2", num: 2, key: "numpy", title: "NumPy", short: "NumPy",
    difficulty: "intermediate",
    why: "Vectorized numerical computing: the engine under Pandas, scikit-learn and PyTorch.",
    topics: ["Arrays", "Dimensions & shape", "Axis", "Broadcasting", "Vectorization", "Indexing & slicing", "Aggregation", "Matrix operations", "Linear algebra", "Random numbers", "Performance"],
    project: "Numerical Market Data Engine",
  },
  {
    id: "p3", num: 3, key: "pandas", title: "Pandas", short: "Pandas",
    difficulty: "intermediate",
    why: "Real data is messy tables with dates. Pandas is how you clean, reshape and query it.",
    topics: ["Series", "DataFrames", "Index", "Selecting & filtering", "Sorting", "GroupBy", "Merge/join/concat", "Missing data", "Duplicates", "Datetime", "Resampling", "Rolling windows", "Transformations", "CSV & Parquet"],
    project: "Stock Data Explorer",
  },
  {
    id: "p4", num: 4, key: "viz", title: "Data Visualization", short: "Viz",
    difficulty: "intermediate",
    why: "A chart is an argument. You need to know which chart answers which question, and when a chart lies.",
    topics: ["Matplotlib", "Seaborn", "Plotly", "Histograms", "Scatter plots", "Line charts", "Candlesticks", "Correlation matrices", "Heatmaps", "Misleading charts"],
    project: "Market Analytics Dashboard",
  },
  {
    id: "p5", num: 5, key: "math", title: "Mathematics for AI", short: "Math",
    difficulty: "advanced",
    why: "ML is linear algebra + calculus + probability. We learn only what is needed, but deeply.",
    topics: ["Vectors & matrices", "Dot product", "Matrix multiplication", "Norms", "Eigenvectors", "Projections", "Derivatives", "Gradients", "Chain rule", "Optimization", "Probability", "Bayes", "Distributions", "Sampling", "Confidence intervals", "Correlation & covariance", "Regression", "Hypothesis testing"],
    project: "Market Statistics Lab",
  },
  {
    id: "p6", num: 6, key: "ml", title: "Machine Learning", short: "ML",
    difficulty: "advanced",
    why: "Learning rules from data instead of writing them. We build the algorithms ourselves before using scikit-learn.",
    topics: ["Features & labels", "Train/val/test", "Parameters vs hyperparameters", "Loss & optimization", "Linear regression", "Logistic regression", "KNN", "Decision trees", "Random forest", "Gradient boosting", "SVM", "Clustering", "PCA", "Look-ahead bias & leakage", "Temporal splits", "Overfitting"],
    project: "Stock Movement Classifier",
  },
  {
    id: "p7", num: 7, key: "features", title: "Feature Engineering", short: "Features",
    difficulty: "advanced",
    why: "Models only see what you give them. Good features and honest features matter more than fancy models.",
    topics: ["Scaling", "Normalization", "Standardization", "Encoding", "Feature selection", "Feature importance", "Rolling features", "Lag features", "Time features"],
    project: "Market Feature Engineering Lab",
  },
  {
    id: "p8", num: 8, key: "timeseries", title: "Time Series", short: "Time Series",
    difficulty: "advanced",
    why: "Market data is ordered in time. That changes how you validate, forecast and fool yourself.",
    topics: ["Trend & seasonality", "Stationarity", "Autocorrelation", "Lags", "Walk-forward validation", "ARIMA concepts", "Exponential smoothing", "ML for time series", "DL for time series"],
    project: "Market Forecasting Lab",
  },
  {
    id: "p9", num: 9, key: "dl", title: "Deep Learning", short: "Deep Learning",
    difficulty: "advanced",
    why: "Neural networks learn their own representations. We build one from scratch in NumPy first.",
    topics: ["Neurons", "Weights & bias", "Activations", "Forward pass", "Backpropagation", "MLP", "CNN", "RNN", "LSTM", "Transformers"],
    project: "Neural Network from Scratch",
  },
  {
    id: "p10", num: 10, key: "pytorch", title: "PyTorch", short: "PyTorch",
    difficulty: "advanced",
    why: "The production framework: autograd, GPUs and training loops, once you know what it is automating.",
    topics: ["Tensors", "Autograd", "Dataset & DataLoader", "nn.Module", "Loss & optimizer", "Training loop", "Validation loop", "Checkpoints", "GPU", "Mixed precision"],
    project: "Manual Training Loop",
  },
  {
    id: "p11", num: 11, key: "nlp", title: "NLP & Embeddings", short: "Embeddings",
    difficulty: "advanced",
    why: "Turning text into vectors makes meaning searchable. This is the foundation of RAG.",
    topics: ["Preprocessing", "Tokenization", "Vocabulary", "Embeddings", "Cosine similarity", "Semantic search", "Attention", "Transformer basics"],
    project: "Financial Document Search Engine",
  },
  {
    id: "p12", num: 12, key: "rag", title: "RAG", short: "RAG",
    difficulty: "engineering",
    why: "Giving an LLM the right facts at question time, with citations, so answers are grounded instead of made up.",
    topics: ["Parsing", "Chunking & overlap", "Vector databases", "Similarity search", "Metadata filtering", "Reranking", "Context windows", "Prompt construction", "Citations", "Evaluation", "Hallucination", "Retrieval failure"],
    project: "RAG Financial Research Assistant",
  },
  {
    id: "p13", num: 13, key: "llm", title: "LLM Engineering", short: "LLMs",
    difficulty: "engineering",
    why: "How LLMs actually generate text, and how to engineer reliable systems around them.",
    topics: ["Architecture", "Tokens & context", "Sampling & temperature", "Prompting", "Structured output", "Tool calling", "Agents", "Evaluation", "Quantization", "Inference", "Fine-tuning", "LoRA / PEFT"],
    project: "Tool-Using Financial AI",
  },
  {
    id: "p14", num: 14, key: "slm", title: "Small Language Models", short: "SLMs",
    difficulty: "engineering",
    why: "When a small specialized model beats a big general one, and the real difference between RAG, fine-tuning and pretraining.",
    topics: ["Pretraining", "Instruction tuning", "Dataset creation", "Training & validation", "Evaluation", "Quantization", "RAG vs fine-tune vs scratch"],
    project: "Specialized Financial SLM (experiment)",
  },
  {
    id: "p15", num: 15, key: "mcp", title: "MCP & Integration", short: "MCP",
    difficulty: "engineering",
    why: "A standard way to connect AI to tools and data. We build our own server before touching Kite or Groww.",
    topics: ["What MCP is", "Client & server", "Tools", "Resources", "Prompts", "Auth & security", "Data flow", "Build a tiny MCP server", "Financial MCP tools"],
    project: "Market Research Agent",
  },
];

// Dependency edges for the knowledge graph: [from, to] means "from" unlocks "to".
export const GRAPH_EDGES = [
  ["computing", "python"],
  ["python", "python-int"],
  ["python", "numpy"],
  ["python-int", "pandas"],
  ["numpy", "pandas"],
  ["pandas", "viz"],
  ["numpy", "math"],
  ["math", "ml"],
  ["pandas", "ml"],
  ["ml", "features"],
  ["features", "timeseries"],
  ["ml", "dl"],
  ["dl", "pytorch"],
  ["pytorch", "timeseries"],
  ["python-int", "nlp"],
  ["dl", "nlp"],
  ["nlp", "rag"],
  ["rag", "llm"],
  ["llm", "slm"],
  ["llm", "mcp"],
];

// Official documentation only. Lessons add targeted readings as we reach them.
export const RESOURCES = {
  computing: [["Python tutorial: using the interpreter", "https://docs.python.org/3/tutorial/interpreter.html"], ["Pro Git book", "https://git-scm.com/book/en/v2"]],
  python: [["The Python Tutorial", "https://docs.python.org/3/tutorial/"]],
  "python-int": [["Python Language Reference", "https://docs.python.org/3/reference/"], ["unittest / testing", "https://docs.python.org/3/library/unittest.html"]],
  numpy: [["NumPy: absolute beginners", "https://numpy.org/doc/stable/user/absolute_beginners.html"]],
  pandas: [["Pandas user guide", "https://pandas.pydata.org/docs/user_guide/index.html"]],
  viz: [["Matplotlib tutorials", "https://matplotlib.org/stable/tutorials/index.html"], ["Plotly Python", "https://plotly.com/python/"]],
  math: [["3Blue1Brown: Essence of linear algebra", "https://www.3blue1brown.com/topics/linear-algebra"]],
  ml: [["scikit-learn user guide", "https://scikit-learn.org/stable/user_guide.html"]],
  features: [["scikit-learn preprocessing", "https://scikit-learn.org/stable/modules/preprocessing.html"]],
  timeseries: [["Forecasting: Principles and Practice", "https://otexts.com/fpp3/"]],
  dl: [["3Blue1Brown: Neural networks", "https://www.3blue1brown.com/topics/neural-networks"]],
  pytorch: [["PyTorch tutorials", "https://pytorch.org/tutorials/"]],
  nlp: [["Hugging Face NLP course", "https://huggingface.co/learn/nlp-course"]],
  rag: [["Sentence Transformers docs", "https://www.sbert.net/"]],
  llm: [["Hugging Face Transformers docs", "https://huggingface.co/docs/transformers"]],
  slm: [["Hugging Face PEFT docs", "https://huggingface.co/docs/peft"]],
  mcp: [["Model Context Protocol", "https://modelcontextprotocol.io/"]],
};

export const PROJECTS = [
  { id: "P00", title: "System Information CLI", phase: "computing", builds: "Show CPU, RAM, disk, OS, Python version, running processes." },
  { id: "P01", title: "Python CLI Calculator", phase: "python", builds: "Parse input, handle errors, loop until quit." },
  { id: "P02", title: "Expense Analyzer", phase: "python", builds: "Add, categorize, total, read CSV, generate report." },
  { id: "P03", title: "CSV / Data Analyzer", phase: "python", builds: "Load any CSV, infer columns, summary statistics." },
  { id: "P04", title: "Stock Data Explorer", phase: "pandas", builds: "OHLCV loading, date ranges, returns, MAs, volatility, drawdowns." },
  { id: "P05", title: "Market Analytics Dashboard", phase: "viz", builds: "Candlesticks, volume, RSI, MACD, return distributions." },
  { id: "P06", title: "Market Statistics Lab", phase: "math", builds: "Return, volatility, correlation, Sharpe, and each metric's limits." },
  { id: "P07", title: "ML Prediction Model", phase: "ml", builds: "Stock movement classifier with temporal splits and no leakage." },
  { id: "P08", title: "Time-Series Model", phase: "timeseries", builds: "Walk-forward forecasting experiments." },
  { id: "P09", title: "Neural Network", phase: "dl", builds: "A tiny network in NumPy, then the same in PyTorch." },
  { id: "P10", title: "Financial Document Search", phase: "nlp", builds: "Chunks → embeddings → vector index → semantic search." },
  { id: "P11", title: "RAG Financial Assistant", phase: "rag", builds: "Grounded answers with citations and visible retrieved chunks." },
  { id: "P12", title: "Tool-Using Financial AI", phase: "llm", builds: "Structured output + tool calling over your own analytics." },
  { id: "P13", title: "Market Research Agent", phase: "mcp", builds: "Your MCP server + data tools, integrated end to end." },
];

// Lessons are authored one at a time. `module` is loaded lazily from js/lessons/.
// `covers` lists the phase topics this lesson counts toward once mastered.
// Written for a complete beginner: every lesson assumes only the lessons before it.
export const LESSONS = [
  { id: "L01", phase: "computing", title: "What Is a Computer?", difficulty: "beginner", module: "lesson01.js", minutes: 45,
    covers: ["CPU", "RAM", "Storage"] },
  { id: "L02", phase: "computing", title: "What Is a Program?", difficulty: "beginner", module: null, minutes: 45,
    covers: ["What programs are", "Files"] },
  { id: "L03", phase: "computing", title: "Meet the Terminal & Type Your First Python", difficulty: "beginner", module: null, minutes: 60,
    covers: ["Terminal"] },
  { id: "L04", phase: "computing", title: "How Python Runs Your Code", difficulty: "beginner", module: "lesson04.js", minutes: 60,
    covers: ["Processes", "Operating systems"] },
  { id: "L05", phase: "computing", title: "Your Python Environment", difficulty: "beginner", module: null, minutes: 75,
    covers: ["Environment variables", "Packages", "Virtual environments"] },
  { id: "L06", phase: "python", title: "Variables and Memory", difficulty: "beginner", module: null, minutes: 75,
    covers: ["Variables", "Data types"] },
];

// A lesson is locked until every lesson before it is mastered.
export const lessonIndex = (id) => LESSONS.findIndex((l) => l.id === id);

// Spaced-revision intervals in days.
export const REVISION_INTERVALS = [1, 3, 7, 14, 30];

export const phaseByKey = (key) => PHASES.find((p) => p.key === key);
export const lessonById = (id) => LESSONS.find((l) => l.id === id);
