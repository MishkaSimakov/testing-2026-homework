# Web-тестирование

В этом проекте я написал тесты для 3-х страниц с http://www.uitestingplayground.com/home:

1. [Shadow DOM](http://www.uitestingplayground.com/shadowdom)
2. [Disabled Input](http://www.uitestingplayground.com/disabledinput)
3. [Clear Input](http://www.uitestingplayground.com/clearinput)

Вспомогательные классы для тестирования находятся в `src/`. В том числе там реализован паттерн PageObject для каждой
тестируемой страницы.

Тесты находятся в `tests`. Я использовал Playwright для тестирования. У playwright уже есть хорошая абстракция для
объектов на странице (`Locator`), поэтому я не стал усложнять код, добавляя абстракции для кнопки, поля ввода и т.п.,
как мы это делали на уроке. При этом Page Object я всё равно использую, чтобы тесты не были привязаны к конкретной
структуре объектов на странице.

## Запуск

На машине должен быть установлен `npm`.

```shell
npm ci
npx playwright install --with-deps chromium
npm run test:report
npm run report:open
```