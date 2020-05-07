import { HumanizerPipe } from './humanizer.pipe';

describe('HumanizerPipe', () => {
  it('create an instance', () => {
    const pipe = new HumanizerPipe();
    expect(pipe).toBeTruthy();
  });
});
