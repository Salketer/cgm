import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Repos } from './repos';

describe('Repos', () => {
  let component: Repos;
  let fixture: ComponentFixture<Repos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Repos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Repos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
