import Login from '../src/login';
const login = new Login('Вход в аккаунт');

test('Проверка на заполнение логина и пароля более 6 символами', () => {
  expect(login.conditionHandling('qwweeee')).toBe(true);
});
test('Проверка не должна пропускать логин и пароль менее чем 6 символов', () => {
  expect(login.conditionHandling('aaa')).toBe(false);
});
test('Проверка не должна пропускать логин и пароль с пробелом в строке', () => {
  expect(login.conditionHandling('  a a a')).toBe(false);
});
