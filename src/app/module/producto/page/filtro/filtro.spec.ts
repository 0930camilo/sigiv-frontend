import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltrosProductoComponent } from './filtro';

describe('FiltrosProductoComponent', () => {
  let component: FiltrosProductoComponent;
  let fixture: ComponentFixture<FiltrosProductoComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosProductoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrosProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
