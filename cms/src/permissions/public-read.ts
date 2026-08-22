import type { Core } from '@strapi/strapi';

export const publicReadActions = [
  'api::about-page.about-page.find',
  'api::article.article.find',
  'api::article.article.findOne',
  'api::author.author.find',
  'api::author.author.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::event.event.find',
  'api::event.event.findOne',
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
] as const;

type PermissionRecord = {
  action: string;
  id: number;
};

type PublicRoleRecord = {
  id: number;
  permissions?: PermissionRecord[];
};

type AdvancedSettings = Record<string, unknown> & {
  allow_register?: boolean;
};

const getAdvancedSettings = (value: unknown): AdvancedSettings =>
  value && typeof value === 'object' ? (value as AdvancedSettings) : {};

export const syncPublicReadPermissions = async (strapi: Core.Strapi) => {
  const publicRole = (await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({
      where: { type: 'public' },
      populate: ['permissions'],
    })) as unknown as PublicRoleRecord | null;

  if (!publicRole) {
    throw new Error('Users & Permissions public role was not initialized.');
  }

  const expectedActions = new Set<string>(publicReadActions);
  const existingPermissions = publicRole.permissions ?? [];

  for (const permission of existingPermissions) {
    if (!expectedActions.has(permission.action)) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .delete({ where: { id: permission.id } });
    }
  }

  const existingActions = new Set(
    existingPermissions.map((permission) => permission.action),
  );

  for (const action of publicReadActions) {
    if (!existingActions.has(action)) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: publicRole.id,
        },
      });
    }
  }

  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'users-permissions',
  });
  const advancedSettings = getAdvancedSettings(
    await pluginStore.get({ key: 'advanced' }),
  );

  if (advancedSettings.allow_register !== false) {
    await pluginStore.set({
      key: 'advanced',
      value: {
        ...advancedSettings,
        allow_register: false,
      },
    });
  }
};
