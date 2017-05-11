import { AngappPage } from './app.po';

describe('angapp App', () => {
  let page: AngappPage;

  beforeEach(() => {
    page = new AngappPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
