import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltrosCategoriaComponent } from './filtro';

describe('FiltrosCategoriaComponent', () => {
  let component: FiltrosCategoriaComponent;
  let fixture: ComponentFixture<FiltrosCategoriaComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosCategoriaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrosCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
