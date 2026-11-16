import assert from 'node:assert/strict';
import test from 'node:test';

import { publicReadActions } from './public-read';

test('public permissions contain only content find actions', () => {
  assert.equal(new Set(publicReadActions).size, publicReadActions.length);

  for (const action of publicReadActions) {
    assert.match(action, /^api::/);
    assert.match(action, /\.(?:find|findOne)$/);
  }
});

test('public permissions cover every public content type', () => {
  const expectedActions = [
    'api::about-page.about-page.find',
    'api::article.article.find',
    'api::article.article.findOne',
    'api::author.author.find',
    'api::author.author.findOne',
    'api::category.category.find',
    'api::category.category.findOne',
    'api::event.event.find',
    'api::event.event.findOne',
    'api::home-page.home-page.find',
    'api::navigation.navigation.find',
    'api::resource.resource.find',
    'api::resource.resource.findOne',
    'api::sermon-series.sermon-series.find',
    'api::sermon-series.sermon-series.findOne',
    'api::sermon.sermon.find',
    'api::sermon.sermon.findOne',
    'api::site-setting.site-setting.find',
    'api::social-links.social-links.find',
    'api::story.story.find',
    'api::story.story.findOne',
  ];

  assert.deepEqual([...publicReadActions].sort(), expectedActions.sort());
});
