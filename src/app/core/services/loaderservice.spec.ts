import { TestBed } from '@angular/core/testing';

import { Loaderservice } from './loaderservice';

describe('Loaderservice', () => {
  let service: Loaderservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loaderservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
