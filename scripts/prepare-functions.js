import { cpSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const files = [
  'server/gemini.js',
  'server/weather.js',
  'server/sarvamNarration.js',
  'server/chatbot_training_keywords.json',
  'src/data.js',
  'src/learningPhotos.js',
]

for (const file of files) {
  const target = resolve(root, 'functions/_runtime', file)
  mkdirSync(dirname(target), { recursive: true })
  cpSync(resolve(root, file), target)
}
