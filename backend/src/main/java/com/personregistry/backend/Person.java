package com.personregistry.backend;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pr_person")
@Getter
@Setter
public class Person {

    @Id
    @Column(name = "tax_code", length = 16, nullable = false, updatable = false)
    private String taxCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String surname;
}
