---
title: Exploring Advanced Code Styling
date: 2026-04-18 17:30:00 +0000
categories: [Programming, Tips]
tags: [python, javascript, coding]
---

Chirpy uses **Rouge** for syntax highlighting. Here's how different languages look:

### Python Example
```python
def greet(name):
    """A simple greeting function."""
    message = f"Hello, {name}!"
    print(message)
    return message

if __name__ == "__main__":
    greet("Eren")
```

### JavaScript with Highlighting
```javascript
const colors = ['red', 'green', 'blue'];
const hexCodes = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff'
};

// Log the hex codes
Object.keys(hexCodes).forEach(color => {
  console.log(`${color}: ${hexCodes[color]}`);
});
```

### Line Numbers and Highlighting
You can also use special comments or configuration if enabled to highlight specific lines in your code blocks.

### Inline Code
This is an example of `inline code` within a paragraph.

### Diff Blocks
```diff
- Old redundant logic
+ New optimized logic
```
