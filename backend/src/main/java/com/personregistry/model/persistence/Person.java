package com.personregistry.model.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pr_person",
       indexes = @Index(name = "ix_person_taxcode", columnList = "tax_code", unique = true))
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

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false, foreignKey = @ForeignKey(name = "fk_person_address"))
    private Address address;
}
