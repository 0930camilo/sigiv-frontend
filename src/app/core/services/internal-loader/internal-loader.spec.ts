import { TestBed } from '@angular/core/testing';

import { InternalLoader } from './internal-loader';

describe('InternalLoader', () => {
  let service: InternalLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternalLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
