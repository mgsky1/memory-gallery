declare module '*.json' {
  const value: {
    photos: import('./index').Photo[]
  }
  export default value
} 