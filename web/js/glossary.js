// The word book: every technical word, in plain English, tagged with the
// lesson that introduces it. In lesson text, write {{RAM}} or {{shown text|Key}}
// and it becomes a tappable word with this meaning.

export const GLOSSARY = {
  // Lesson 01
  "Computer": { lesson: "L01", def: "A machine that follows instructions very fast. It takes input, processes it, stores it, and gives output." },
  "Input": { lesson: "L01", def: "Anything going INTO the computer: key presses, mouse clicks, touch, microphone sound, data arriving from the internet." },
  "Output": { lesson: "L01", def: "Anything coming OUT of the computer: pictures on the screen, sound, a printed page, data sent over the internet." },
  "CPU": { lesson: "L01", def: "Central Processing Unit: the 'worker' chip that does all the calculating and deciding, billions of tiny steps per second." },
  "RAM": { lesson: "L01", def: "Random Access Memory: the computer's 'desk'. Fast working space for whatever is open right now. It is wiped when the power goes off." },
  "Storage": { lesson: "L01", def: "The computer's 'filing cabinet' (SSD or hard disk). Keeps files and apps permanently, even with the power off, but is slower than RAM." },
  "SSD": { lesson: "L01", def: "Solid State Drive: the most common kind of storage today. No moving parts, much faster than an old spinning hard disk." },
  "Network": { lesson: "L01", def: "The connection (Wi-Fi, cable, mobile data) that lets your computer send and receive data to and from other computers." },
  "Server": { lesson: "L01", def: "A computer somewhere else whose job is to answer requests from other computers, e.g. the broker's computer that sends you live prices." },
  "Bit": { lesson: "L01", def: "The smallest piece of data: a single switch that is either 0 (off) or 1 (on)." },
  "Byte": { lesson: "L01", def: "A group of 8 bits. One byte can store a number from 0 to 255, or one English letter." },
  "KB/MB/GB": { lesson: "L01", def: "Sizes of data. 1 KB ≈ a thousand bytes (a short message), 1 MB ≈ a million (a photo), 1 GB ≈ a billion (a movie), 1 TB ≈ a trillion." },
  "GHz": { lesson: "L01", def: "Gigahertz: how many billions of 'ticks' per second the CPU's clock makes. 3 GHz = 3 billion ticks every second." },
  "Core": { lesson: "L01", def: "One independent worker inside the CPU. A 'quad-core' CPU has 4 workers that can do different jobs at the same time." },
  "Volatile": { lesson: "L01", def: "Loses its contents when the power goes off. RAM is volatile; storage is not." },
  "Page file": { lesson: "L01", def: "When RAM is full, Windows borrows space on the (much slower) SSD as extra RAM. That's why a computer with too little RAM becomes slow." },
  "Operating system": { lesson: "L01", def: "The main program that manages the computer (Windows, macOS, Android). It runs other apps and shares the CPU, RAM and storage between them." },
  "Program": { lesson: "L01", def: "A list of exact instructions for a computer to follow, in order. Apps are programs." },
  "Data": { lesson: "L01", def: "Information stored as numbers: prices, text, photos, sounds. To a computer, everything is data made of bits." },
  "Cache": { lesson: "L01", def: "A small, fast store that keeps recently or frequently used data close by, so it doesn't have to be fetched from somewhere slower again." },
  "Virtual memory": { lesson: "L01", def: "The OS gives every program its own private, numbered memory space and maps it onto real RAM (or the page file) behind the scenes." },
  "GPU": { lesson: "L01", def: "Graphics Processing Unit: a chip with thousands of simple workers doing the same maths at once. Used for graphics and for training AI." },
  "Cloud": { lesson: "L01", def: "Computers in someone else's data centre that you rent by the hour to run your programs (e.g. AWS, Google Cloud, Azure)." },
  "vCPU": { lesson: "L01", def: "Virtual CPU: one share of a real CPU core, the unit in which cloud servers are rented." },
  "Latency": { lesson: "L01", def: "The delay between asking for something and getting the answer, usually in milliseconds (ms)." },
  "OHLCV": { lesson: "L01", def: "Open, High, Low, Close, Volume: the five numbers that describe one period (e.g. one day) of a stock's trading." },
};

export const lookup = (key) => {
  const k = Object.keys(GLOSSARY).find((g) => g.toLowerCase() === key.toLowerCase());
  return k ? { word: k, ...GLOSSARY[k] } : null;
};
