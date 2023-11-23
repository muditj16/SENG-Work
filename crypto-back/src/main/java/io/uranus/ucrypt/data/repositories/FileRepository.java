package io.uranus.ucrypt.data.repositories;

import io.uranus.ucrypt.data.entities.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;


@Repository
public interface FileRepository extends JpaRepository<File, Long>, JpaSpecificationExecutor<File> {
    boolean existsByName(String name);
}
