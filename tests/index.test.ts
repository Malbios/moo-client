import MooClient from '../src/index';

describe('MooClient Tests', () => {
    it('should be created with no errors', async () => {
        new MooClient('', 0, '', '');
    });
});