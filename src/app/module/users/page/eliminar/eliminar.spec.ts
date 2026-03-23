import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EliminarProveedorComponent } from './eliminar';

describe('EditarProveedorComponent', () => {
  let component: EliminarProveedorComponent;
  let fixture: ComponentFixture<EliminarProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminarProveedorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EliminarProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
