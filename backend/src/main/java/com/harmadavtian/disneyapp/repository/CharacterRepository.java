package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
}