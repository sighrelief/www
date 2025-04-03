// @ts-nocheck

const data = await fetch(
  'https://api.neatqueue.com/api/history/1226193436521267223'
).then((res) => res.json())

const parsed_and_sorted = data.data.toSorted((a, b) => {
  return a.game_num - b.game_num
})

await Bun.write('./src/data.json', JSON.stringify(parsed_and_sorted, null, 2))
