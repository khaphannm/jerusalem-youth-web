import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import {
  getEventTimingError,
  getResourceSourceError,
  type ContentValues,
} from './validation/content-rules';

type WriteContext = {
  action: string;
  params: {
    data?: ContentValues;
    documentId?: string;
    status?: 'draft' | 'published';
  };
  uid: string;
};

const getValues = (value: unknown): ContentValues =>
  value && typeof value === 'object' ? (value as ContentValues) : {};

const lifecycle = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (context, next) => {
      const { action, params, uid } = context as unknown as WriteContext;

      if (action !== 'create' && action !== 'update') {
        return next();
      }

      const incoming = params.data ?? {};

      if (uid === 'api::event.event') {
        const existing = params.documentId
          ? await strapi.documents('api::event.event').findOne({
              documentId: params.documentId,
              fields: ['startDateTime', 'endDateTime'],
              status: params.status,
            })
          : undefined;
        const error = getEventTimingError({
          ...getValues(existing),
          ...incoming,
        });

        if (error) {
          throw new errors.ValidationError(error);
        }
      }

      if (uid === 'api::resource.resource') {
        const existing = params.documentId
          ? await strapi.documents('api::resource.resource').findOne({
              documentId: params.documentId,
              fields: ['externalURL'],
              populate: { file: true },
              status: params.status,
            })
          : undefined;
        const error = getResourceSourceError(incoming, getValues(existing));

        if (error) {
          throw new errors.ValidationError(error);
        }
      }

      return next();
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};

export default lifecycle;
