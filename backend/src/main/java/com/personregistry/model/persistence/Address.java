package com.personregistry.model.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pr_address",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_address_fields",
           columnNames = {"street","street_no","city","province","country"}
       ))
@Getter
@Setter
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String street;

    @Column(name = "street_no", nullable = false)
    private String streetNo;

    @Column(nullable = false)
    private String city;

    @Column(length = 2, nullable = false)
    private String province;

    @Column(nullable = false)
    private String country;
}
