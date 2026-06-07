# Scroll Effects Guide

This guide explains how to add scroll reveal animations to elements throughout your portfolio.

## Available Scroll Effects

### 1. **fade-bottom** (Default)
Elements fade in while sliding up from below.
```jsx
<div className="reveal fade-bottom">Content</div>
```

### 2. **fade-top**
Elements fade in while sliding down from above.
```jsx
<div className="reveal fade-top">Content</div>
```

### 3. **fade-left**
Elements fade in while sliding from the left.
```jsx
<div className="reveal fade-left">Content</div>
```

### 4. **fade-right**
Elements fade in while sliding from the right.
```jsx
<div className="reveal fade-right">Content</div>
```

### 5. **scale-in**
Elements fade in while scaling up.
```jsx
<div className="reveal scale-in">Content</div>
```

### 6. **rotate-in**
Elements fade in while rotating and scaling.
```jsx
<div className="reveal rotate-in">Content</div>
```

### 7. **bounce-in**
Elements bounce into view with a spring effect.
```jsx
<div className="reveal bounce-in">Content</div>
```

### 8. **slide-up-rotate**
Elements slide up with a 3D rotation effect.
```jsx
<div className="reveal slide-up-rotate">Content</div>
```

### 9. **zoom-fade**
Elements fade in with a smooth zoom effect.
```jsx
<div className="reveal zoom-fade">Content</div>
```

### 10. **flip-in**
Elements flip into view (3D effect).
```jsx
<div className="reveal flip-in">Content</div>
```

### 11. **blur-fade**
Elements fade in with a blur transition.
```jsx
<div className="reveal blur-fade">Content</div>
```

## Using the Custom Hook

You can also use the `useScrollReveal` hook for programmatic control:

```jsx
import useScrollReveal from './useScrollReveal'

export default function MyComponent() {
  const ref = useScrollReveal('fade-bottom', 0.1)
  
  return (
    <div ref={ref}>
      This element will animate when scrolled into view
    </div>
  )
}
```

### Hook Parameters

```javascript
useScrollReveal(effectClass, threshold)

// effectClass: string - The animation effect class (default: 'fade-bottom')
// threshold: number - How much of element must be visible (0-1, default: 0.1)
```

## Combining Multiple Classes

You can combine the reveal class with effect classes:

```jsx
<div className="reveal fade-left">
  <h2>Title</h2>
</div>

<div className="reveal scale-in">
  <img src="image.jpg" alt="Image" />
</div>
```

## Staggering Effects

For sequential animations on multiple elements, add staggered delays via inline styles:

```jsx
<div className="reveal fade-bottom" style={{ transitionDelay: '0s' }}>Item 1</div>
<div className="reveal fade-bottom" style={{ transitionDelay: '0.1s' }}>Item 2</div>
<div className="reveal fade-bottom" style={{ transitionDelay: '0.2s' }}>Item 3</div>
```

## How It Works

1. Elements are added with `reveal` class and an effect class
2. CSS sets initial state (opacity: 0, transform applied)
3. IntersectionObserver watches when elements enter viewport
4. When visible, `active` class is added, triggering CSS transition
5. Transition smoothly animates from initial state to final state

## Animation Timing

- **Transition Duration**: 0.8s
- **Easing**: cubic-bezier(0.25, 0.46, 0.45, 0.94) (smooth easing)
- **Threshold**: 10% visibility (element must be 10% visible to trigger)

## Tips

- Use `fade-left` for left-aligned content
- Use `fade-right` for right-aligned content
- Use `scale-in` for cards and boxes
- Use `rotate-in` or `bounce-in` for call-to-action elements
- Use `blur-fade` for images and backgrounds
- Combine with staggered delays for professional sequences
