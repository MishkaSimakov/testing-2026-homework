import {beforeEach} from 'vitest';
import {cleanupDb} from '@/db';

beforeEach(cleanupDb);