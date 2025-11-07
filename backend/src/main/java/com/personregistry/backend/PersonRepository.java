package com.personregistry.backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonRepository extends JpaRepository<Person, String> {
    boolean existsByTaxCode(String taxCode);
    Person findByTaxCode(String taxCode);
}