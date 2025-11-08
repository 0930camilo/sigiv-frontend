import { TestBed } from '@angular/core/testing';

import { HeaderTokenUtil } from './header-token-util';

describe('HeaderTokenUtil', () => {
  let service: HeaderTokenUtil;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderTokenUtil);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
