# HSK 단어장

중국어 공부용 모바일 웹사이트: HSK 단어장, 문제풀이, 오답노트, 한자 쓰기 연습.

- `docs/` — 그대로 배포하는 정적 사이트 (GitHub Pages 등)
- `data-src/ko/*.tsv` — 한국어 뜻 (`단어<TAB>뜻[<TAB>병음 지정]`)
- `tools/build.js` — 단어 데이터 + 한국어 뜻 + 한자음 → `docs/data/words.json`, 획순 데이터 → `docs/strokes/`

```
npm install
curl -L -o tools/complete.json https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json
node tools/build.js
```

데이터 출처: complete-hsk-vocabulary (MIT), CC-CEDICT (CC BY-SA), Hanzi Writer (MIT), Make Me a Hanzi 획순 (Arphic Public License), hanja (MIT)
