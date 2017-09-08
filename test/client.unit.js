//jshint esversion: 6
import { Client } from '../lib/client';
import { assert } from 'chai';

//fake objects
import meteor from './meteor';
import { Video as video } from '../lib/video';
import tracker from './tracker';

describe( 'Meteor Video Chat client', () => {
	const client = new Client({ meteor, video, tracker });

	it( 'should create the MeteorVideoChat object', () => {
		assert.isDefined(client);

	});
});
