import {beforeEach} from 'vitest';
import {cleanupDb} from '@/db';
import {faker} from '@faker-js/faker';

beforeEach(cleanupDb);

// set faker seed so that test runs are reproducible
beforeEach(() => {
    faker.seed(42);
});