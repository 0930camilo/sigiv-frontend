import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltrosUsuarioComponent } from './filtro';

describe('FiltrosUsuarioComponent', () => {
  let component: FiltrosUsuarioComponent;
  let fixture: ComponentFixture<FiltrosUsuarioComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosUsuarioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrosUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
