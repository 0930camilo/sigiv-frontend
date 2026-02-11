import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltrosProveedorComponent } from './filtro';

describe('FiltrosProveedorComponent', () => {
  let component: FiltrosProveedorComponent;
  let fixture: ComponentFixture<FiltrosProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosProveedorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrosProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
