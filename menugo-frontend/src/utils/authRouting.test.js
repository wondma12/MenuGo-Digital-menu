import test from 'node:test';
import assert from 'node:assert/strict';
import { getEffectiveRole, getPostLoginRedirectPath, getSafeReturnPath } from './authRouting.js';

const makeJwt = (payload) => {
  const enc = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `header.${enc(payload)}.signature`;
};

test('restaurant admins stay on the admin dashboard after login', () => {
  assert.equal(getPostLoginRedirectPath('admin', '/menu/beles'), '/admin/dashboard');
});

test('customers can still return to the restaurant menu after login', () => {
  assert.equal(getPostLoginRedirectPath('customer', '/menu/beles'), '/menu/beles');
});

test('force-login staff flows still go to the staff dashboard instead of the menu', () => {
  assert.equal(getPostLoginRedirectPath('restaurant_admin', '/menu/beles', null), '/admin/dashboard');
});

test('staff roles can be recovered from the token when the in-memory user is still stale', () => {
  const token = makeJwt({ role: 'customer', staff: { role: 'admin' } });
  assert.equal(getEffectiveRole({ role: 'customer' }, token), 'restaurant_admin');
  assert.equal(getPostLoginRedirectPath({ role: 'customer' }, '/menu/beles', token), '/admin/dashboard');
});

test('staff login keeps the restaurant return path and blocks unsafe external redirects', () => {
  assert.equal(getSafeReturnPath('/menu/beles-restaurant'), '/menu/beles-restaurant');
  assert.equal(getSafeReturnPath('menu/beles-restaurant'), '/menu/beles-restaurant');
  assert.equal(getSafeReturnPath('https://evil.example/steal'), null);
  assert.equal(getSafeReturnPath(' javascript:alert(1)'), null);
});
